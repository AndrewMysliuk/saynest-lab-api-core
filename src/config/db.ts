import mongoose from "mongoose"

import { MODEL_NAME as STATISTICS_TABLE } from "../internal/communication_review/storage/mongo/model"
import { MODEL_NAME as CONVERSATION_TABLE } from "../internal/conversation/storage/mongo/model"
import { MODEL_NAME as ERROR_ANALYSIS_TABLE } from "../internal/error_analysis/storage/mongo/model"
import { MODEL_NAME as ORGANISATION_TABLE } from "../internal/organisation/storage/mongo/model"
import { MODEL_NAME as SESSION_TABLE } from "../internal/session/storage/mongo/model"
import { MODEL_NAME as USER_TABLE } from "../internal/user/storage/mongo/model"
import { MODEL_NAME as VOCABULARY_TABLE } from "../internal/vocabulary_tracker/storage/mongo/model"
import logger from "../utils/logger"
import { serverConfig } from "./server_config"

const MONGO_URI = serverConfig.MONGO_URI
const CURRENT_TABLES = [ORGANISATION_TABLE, USER_TABLE, SESSION_TABLE, CONVERSATION_TABLE, ERROR_ANALYSIS_TABLE, VOCABULARY_TABLE, STATISTICS_TABLE]

export const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI)

    const dbName = mongoose.connection.db?.databaseName
    logger.info(`Connected to MongoDB. Using database: ${dbName}`)

    const existingCollections = await mongoose.connection.db?.listCollections().toArray()
    const existingNames = existingCollections?.map((col) => col.name) || []

    for (const name of CURRENT_TABLES) {
      if (!existingNames.includes(name)) {
        await mongoose.connection.db?.createCollection(name)
        logger.info(`Created collection: ${name}`)
      }
    }
  } catch (error: unknown) {
    logger.error(`Failed to connect to MongoDB: ${JSON.stringify(error)}`)
    process.exit(1)
  }
}

export const disconnectFromDatabase = async () => {
  try {
    await mongoose.disconnect()
    logger.info("Disconnected from MongoDB.")
  } catch (error: unknown) {
    logger.error(`Failed to disconnect from MongoDB: ${JSON.stringify(error)}`)
  }
}
