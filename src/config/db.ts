import mongoose from "mongoose"

import { MODEL_NAME as REFRESH_TOKENS } from "../internal/auth/storage/mongo/model"
import { MODEL_NAME as COMMUNICATION_REVIEWS_TABLE } from "../internal/communication_review/storage/mongo/model"
import { MODEL_NAME as CONVERSATION_TABLE } from "../internal/conversation/storage/mongo/model"
import { MODEL_NAME as ERROR_ANALYSIS_TABLE } from "../internal/error_analysis/storage/mongo/model"
import { MODEL_NAME as ORGANISATION_TABLE } from "../internal/organisation/storage/mongo/model"
import { MODEL_NAME as SESSION_TABLE } from "../internal/session/storage/mongo/model"
import { MODEL_NAME as TASK_TABLE } from "../internal/task_generator/storage/mongo/model"
import { MODEL_NAME as USER_TABLE } from "../internal/user/storage/mongo/model"
import { MODEL_NAME as USER_PROGRESS_TABLE } from "../internal/user_progress/storage/mongo/model"
import { MODEL_NAME as VOCABULARY_TABLE } from "../internal/vocabulary_tracker/storage/mongo/model"
import { createScopedLogger } from "../utils/logger"
import { serverConfig } from "./server_config"

const log = createScopedLogger("database")
const MONGO_URI = serverConfig.MONGO_URI
// const MONGO_LOCAL_URI = serverConfig.MONGO_LOCAL_URI

const CURRENT_TABLES = [
  ORGANISATION_TABLE,
  USER_TABLE,
  REFRESH_TOKENS,
  SESSION_TABLE,
  CONVERSATION_TABLE,
  ERROR_ANALYSIS_TABLE,
  VOCABULARY_TABLE,
  COMMUNICATION_REVIEWS_TABLE,
  TASK_TABLE,
  USER_PROGRESS_TABLE,
]

export const connectToDatabase = async () => {
  const maxAttempts = 5
  const retryDelay = 3000

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await mongoose.connect(MONGO_URI)

      const dbName = mongoose.connection.db?.databaseName
      log.info("connectToDatabase", "Connected to MongoDB", { dbName })

      const existingCollections = await mongoose.connection.db?.listCollections().toArray()
      const existingNames = existingCollections?.map((col) => col.name) || []

      for (const name of CURRENT_TABLES) {
        if (!existingNames.includes(name)) {
          await mongoose.connection.db?.createCollection(name)
          log.info("connectToDatabase", "Created missing collection", { name })
        }
      }

      return
    } catch (error) {
      log.error("connectToDatabase", `MongoDB connection attempt ${attempt} failed`, {
        error,
        attempt,
      })

      if (attempt < maxAttempts) {
        log.warn("connectToDatabase", "Retrying connection", { waitMs: retryDelay })
        await new Promise((res) => setTimeout(res, retryDelay))
      } else {
        log.error("connectToDatabase", "Max attempts exceeded. Exiting.")
        process.exit(1)
      }
    }
  }
}

export const disconnectFromDatabase = async () => {
  try {
    await mongoose.disconnect()
    log.info("disconnectFromDatabase", "Disconnected from MongoDB")
  } catch (error) {
    log.error("disconnectFromDatabase", "Failed to disconnect from MongoDB", { error })
  }
}
