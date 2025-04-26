import fs from "fs/promises"
import path from "path"

import { StatisticsModel } from "../internal/communication_review/storage/mongo/model"
import { ConversationHistoryModel } from "../internal/conversation/storage/mongo/model"
import { ErrorAnalysisModel } from "../internal/error_analysis/storage/mongo/model"
import { SessionModel } from "../internal/session/storage/mongo/model"
import { VocabularyModel } from "../internal/vocabulary_tracker/storage/mongo/model"
import { formatBytes } from "../utils"
import logger from "../utils/logger"

const CLEAN_INTERVAL_MS = 5 * 60 * 1000
const SESSION_EXPIRATION_MINUTES = 30
const USER_SESSIONS_FOLDER = path.join(process.cwd(), "user_sessions")

let shouldRunCleanup = true

export async function cleanUserSessionFiles(sessionIds: string[]): Promise<{ filesDeleted: number; bytesFreed: number }> {
  let filesDeleted = 0
  let bytesFreed = 0

  try {
    const files = await fs.readdir(USER_SESSIONS_FOLDER)

    for (const file of files) {
      if (sessionIds.some((id) => file.includes(id.toString()))) {
        const fullPath = path.join(USER_SESSIONS_FOLDER, file)
        try {
          const stat = await fs.lstat(fullPath)

          bytesFreed += stat.size

          if (stat.isDirectory()) {
            await fs.rm(fullPath, { recursive: true, force: true })
            logger.info(`Deleted directory: ${file}`)
          } else {
            await fs.unlink(fullPath)
            logger.info(`Deleted file: ${file}`)
          }

          filesDeleted++
        } catch (err) {
          logger.error(`Error deleting file/directory: ${file}`, err)
        }
      }
    }
  } catch (error) {
    logger.error("Error reading user_sessions directory:", error)
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
