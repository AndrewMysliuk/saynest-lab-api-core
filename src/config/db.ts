import mongoose from "mongoose"

import { TABLE_NAME as CONVERSATION_TABLE } from "../internal/conversation/storage/mongo/model"
import { TABLE_NAME as ERROR_ANALYSIS_TABLE } from "../internal/error_analysis/storage/mongo/model"
import { TABLE_NAME as SESSION_TABLE } from "../internal/session/storage/mongo/model"
import { TABLE_NAME as VOCABULARY_TABLE } from "../internal/vocabulary_tracker/storage/mongo/model"
import logger from "../utils/logger"
import { serverConfig } from "./server_config"

const MONGO_URI = serverConfig.MONGO_URI
const CURRENT_TABLES = [CONVERSATION_TABLE, ERROR_ANALYSIS_TABLE, SESSION_TABLE, VOCABULARY_TABLE]

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
    logger.error(`Failed to connect to MongoDB: ${error}`)
    process.exit(1)
  }
}
