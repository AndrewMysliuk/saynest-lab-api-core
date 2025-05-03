import { StatisticsModel } from "../internal/communication_review/storage/mongo/model"
import { ConversationHistoryModel } from "../internal/conversation/storage/mongo/model"
import { ErrorAnalysisModel } from "../internal/error_analysis/storage/mongo/model"
import { SessionModel } from "../internal/session/storage/mongo/model"
import { VocabularyModel } from "../internal/vocabulary_tracker/storage/mongo/model"
import { ISessionIds } from "../types"
import { getStorageFilePath, logger } from "../utils"
import { gcsBucket } from "./gcp_storage"

const CLEAN_INTERVAL_MS = 60 * 60 * 1000
const SESSION_EXPIRATION_MINUTES = 240

let shouldRunCleanup = true

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
        logger.info(`[CLEANUP] No files found for prefix "${prefix}"`)
        continue
      }

      await Promise.all(files.map((file) => file.delete()))

      logger.info(`[CLEANUP] Deleted ${files.length} file(s) from "${prefix}"`)
      totalDeleted += files.length
    } catch (error) {
      logger.warn(`[CLEANUP] Failed to delete files for session ${data._id} (prefix: "${prefix}"):`, error)
    }
  }

  try {
    const [files] = await gcsBucket.getFiles({ prefix: `${envPrefix}/` })
    const rootLevelGarbage = files.filter((file) => {
      const parts = file.name.split("/")
      return parts.length === 2 && (parts[1].includes("user-request") || parts[1].includes("model-response"))
    })

    if (rootLevelGarbage.length) {
      const deletePromises = rootLevelGarbage.map((file) => file.delete())
      await Promise.all(deletePromises)

      logger.info(`[CLEANUP] Deleted ${rootLevelGarbage.length} root-level orphan files in '${envPrefix}/'`)
      totalDeleted += rootLevelGarbage.length
    }
  } catch (err) {
    logger.warn("[CLEANUP] Failed to clean root-level files:", err)
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
      logger.info(`[CLEANUP] No expired sessions found.`)
      return
    }

    logger.info(`[CLEANUP] Found ${sessionIds.length} expired sessions to remove.`)

    const [statsDeleted, convHistDeleted, errorsDeleted, vocabsDeleted] = await Promise.all([
      StatisticsModel.deleteMany({ session_id: { $in: sessionIds } }),
      ConversationHistoryModel.deleteMany({ session_id: { $in: sessionIds } }),
      ErrorAnalysisModel.deleteMany({ session_id: { $in: sessionIds } }),
      VocabularyModel.deleteMany({ session_id: { $in: sessionIds } }),
      SessionModel.deleteMany({ _id: { $in: sessionIds } }),
    ])

    logger.info(`[CLEANUP] Deleted ${sessionIds.length} expired sessions from database.`)
    logger.info(
      `[CLEANUP] Related deletes: Statistics=${statsDeleted.deletedCount}, Histories=${convHistDeleted.deletedCount}, Errors=${errorsDeleted.deletedCount}, Vocabularies=${vocabsDeleted.deletedCount}`,
    )

    const { filesDeleted } = await cleanUserSessionFiles(sessionIds)

    logger.info(`[CLEANUP] Deleted ${filesDeleted} files/folders.`)
  } catch (error) {
    logger.error("[CLEANUP] Error during session cleanup:", error)
  }
}

export async function startCleanupWorker() {
  logger.info("Starting session cleanup worker...")

  async function loop() {
    while (shouldRunCleanup) {
      const start = Date.now()

      try {
        await cleanExpiredSessions()
      } catch (error) {
        logger.error("[CLEANUP] Error during cleanup execution:", error)
      }

      const elapsed = Date.now() - start
      const delay = Math.max(CLEAN_INTERVAL_MS - elapsed, 0)

      if (delay > 0) {
        logger.info(`[CLEANUP] Waiting ${(delay / 1000).toFixed(2)} seconds before next run.`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  loop()
}

export function stopCleanupWorker() {
  shouldRunCleanup = false
  logger.info("Session cleanup worker stop requested.")
}
