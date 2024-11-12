import mongoose from "mongoose"
import { serverConfig } from "./serverConfig"
import logger from "../utils/logger"

const MONGO_URI = serverConfig.MONGO_URI

export const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI)
    logger.info("Connected to MongoDB")
  } catch (error: unknown) {
    logger.error(`Failed to connect to MongoDB: ${error}`)
    process.exit(1)
  }
}
