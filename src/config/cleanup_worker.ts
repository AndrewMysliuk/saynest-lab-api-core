import { StatisticsModel } from "../internal/communication_review/storage/mongo/model"
import { ConversationHistoryModel } from "../internal/conversation/storage/mongo/model"
import { ErrorAnalysisModel } from "../internal/error_analysis/storage/mongo/model"
import { SessionModel } from "../internal/session/storage/mongo/model"
import { VocabularyModel } from "../internal/vocabulary_tracker/storage/mongo/model"
import { ISessionIds } from "../types"
import { createScopedLogger, getStorageFilePath } from "../utils"
import { gcsBucket } from "./gcp_storage"

const CLEAN_INTERVAL_MS = 60 * 60 * 1000
const SESSION_EXPIRATION_MINUTES = 240

let shouldRunCleanup = true
const log = createScopedLogger("cleanupWorker")

export async function cleanUserSessionFiles(sessionIds: ISessionIds[]): Promise<{ filesDeleted: number }> {
  let totalDeleted = 0
  const envPrefix = process.env.NODE_ENV === "production" ? "prod" : "dev"

  for (const data of sessionIds) {
    const prefix =
      getStorageFilePath({
        session_id: data._id,
        organization_id: data.organization_id,
        user_id: data.user_id,
      }) + "/"

    try {
      const [files] = await gcsBucket.getFiles({ prefix })

      if (!files.length) {
        log.info("cleanUserSessionFiles", "No files found for session prefix", { prefix })
        continue
      }

      await Promise.all(files.map((file) => file.delete()))
      log.info("cleanUserSessionFiles", "Deleted session files", { prefix, count: files.length })

      totalDeleted += files.length
    } catch (error) {
      log.warn("cleanUserSessionFiles", "Failed to delete files", { prefix, error })
    }
  }

  try {
    const [files] = await gcsBucket.getFiles({ prefix: `${envPrefix}/` })
    const rootLevelGarbage = files.filter((file) => {
      const parts = file.name.split("/")
      return parts.length === 2 && (parts[1].includes("user-request") || parts[1].includes("model-response"))
    })

    if (rootLevelGarbage.length) {
      await Promise.all(rootLevelGarbage.map((file) => file.delete()))
      log.info("cleanUserSessionFiles", "Deleted orphan root-level files", {
        prefix: `${envPrefix}/`,
        count: rootLevelGarbage.length,
      })

      totalDeleted += rootLevelGarbage.length
    }
  } catch (error) {
    log.warn("cleanUserSessionFiles", "Failed to clean root-level files", { error })
  }

  return { filesDeleted: totalDeleted }
}

async function cleanExpiredSessions() {
  const now = new Date()
  const expirationTime = new Date(now.getTime() - SESSION_EXPIRATION_MINUTES * 60000)

  try {
    const expiredSessions = await SessionModel.find({
      ended_at: null,
      created_at: { $lt: expirationTime },
    })

    const sessionIds: ISessionIds[] = expiredSessions.map((s) => ({
      _id: s._id.toString(),
      organization_id: s.organization_id?.toString(),
      user_id: s.user_id?.toString(),
    }))

    if (!sessionIds.length) {
      log.info("cleanExpiredSessions", "No expired sessions found")
      return
    }

    log.info("cleanExpiredSessions", "Expired sessions to remove", { count: sessionIds.length })

    const [statsDeleted, convHistDeleted, errorsDeleted, vocabsDeleted] = await Promise.all([
      StatisticsModel.deleteMany({ session_id: { $in: sessionIds } }),
      ConversationHistoryModel.deleteMany({ session_id: { $in: sessionIds } }),
      ErrorAnalysisModel.deleteMany({ session_id: { $in: sessionIds } }),
      VocabularyModel.deleteMany({ session_id: { $in: sessionIds } }),
      SessionModel.deleteMany({ _id: { $in: sessionIds } }),
    ])

    log.info("cleanExpiredSessions", "Session-related deletions complete", {
      statistics: statsDeleted.deletedCount,
      histories: convHistDeleted.deletedCount,
      errors: errorsDeleted.deletedCount,
      vocabularies: vocabsDeleted.deletedCount,
    })

    const { filesDeleted } = await cleanUserSessionFiles(sessionIds)
    log.info("cleanExpiredSessions", "Session file deletions complete", { filesDeleted })
  } catch (error) {
    log.error("cleanExpiredSessions", "Error during session cleanup", { error })
  }
}

export async function startCleanupWorker() {
  log.info("startCleanupWorker", "Starting session cleanup loop...")

  async function loop() {
    while (shouldRunCleanup) {
      const start = Date.now()

      try {
        await cleanExpiredSessions()
      } catch (error) {
        log.error("loop", "Error during cleanup execution", { error })
      }

      const elapsed = Date.now() - start
      const delay = Math.max(CLEAN_INTERVAL_MS - elapsed, 0)

      if (delay > 0) {
        log.info("loop", "Sleeping before next cleanup run", { delaySeconds: +(delay / 1000).toFixed(2) })
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  loop()
}

export function stopCleanupWorker() {
  shouldRunCleanup = false
  log.info("stopCleanupWorker", "Cleanup worker stop requested")
}
