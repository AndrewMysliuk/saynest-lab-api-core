import fs from "fs/promises"
import path from "path"

import { StatisticsModel } from "../internal/communication_review/storage/mongo/model"
import { ConversationHistoryModel } from "../internal/conversation/storage/mongo/model"
import { ErrorAnalysisModel } from "../internal/error_analysis/storage/mongo/model"
import { SessionModel } from "../internal/session/storage/mongo/model"
import { VocabularyModel } from "../internal/vocabulary_tracker/storage/mongo/model"
import { formatBytes } from "../utils"
import logger from "../utils/logger"

const CLEAN_INTERVAL_MS = 30 * 60 * 1000
const SESSION_EXPIRATION_MINUTES = 240
const USER_SESSIONS_FOLDER = path.join(process.cwd(), "user_sessions")

let shouldRunCleanup = true

export async function cleanUserSessionFiles(sessionIds: string[]): Promise<{ filesDeleted: number; bytesFreed: number }> {
  let filesDeleted = 0
  let bytesFreed = 0

  async function traverseAndClean(directory: string) {
    const entries = await fs.readdir(directory, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name)

      if (entry.isDirectory()) {
        if (entry.name.startsWith("session-") && sessionIds.some((id) => entry.name === `session-${id}`)) {
          const stat = await fs.lstat(fullPath)
          bytesFreed += stat.size

          await fs.rm(fullPath, { recursive: true, force: true })
          logger.info(`Deleted session directory: ${fullPath}`)
          filesDeleted++
        } else {
          await traverseAndClean(fullPath)
        }
      }
    }
  }

  async function cleanRootFiles() {
    const rootEntries = await fs.readdir(USER_SESSIONS_FOLDER, { withFileTypes: true })

    for (const entry of rootEntries) {
      if (entry.isFile()) {
        const fullPath = path.join(USER_SESSIONS_FOLDER, entry.name)

        if (entry.name.includes("user-request") || entry.name.includes("model-response")) {
          const stat = await fs.lstat(fullPath)
          bytesFreed += stat.size

          await fs.unlink(fullPath)
          logger.info(`Deleted root file: ${fullPath}`)
          filesDeleted++
        }
      }
    }
  }

  try {
    await Promise.all([traverseAndClean(USER_SESSIONS_FOLDER), cleanRootFiles()])
  } catch (error) {
    logger.error("Error cleaning user_sessions directory:", error)
  }

  return { filesDeleted, bytesFreed }
}

async function cleanExpiredSessions() {
  const now = new Date()
  const expirationTime = new Date(now.getTime() - SESSION_EXPIRATION_MINUTES * 60000)

  try {
    const expiredSessions = await SessionModel.find({
      ended_at: null,
      created_at: { $lt: expirationTime },
    }).select("_id")

    const sessionIds = expiredSessions.map((s) => s._id.toString())

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

    const { filesDeleted, bytesFreed } = await cleanUserSessionFiles(sessionIds)

    logger.info(`[CLEANUP] Deleted ${filesDeleted} files/folders.`)
    logger.info(`[CLEANUP] Freed approximately ${formatBytes(bytesFreed)} of disk space.`)
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
