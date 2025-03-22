import mongoose from "mongoose";

import { TABLE_NAME } from "../internal/conversation/storage/mongo/model";
import logger from "../utils/logger";
import { serverConfig } from "./server_config";

const MONGO_URI = serverConfig.MONGO_URI;

export const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    const dbName = mongoose.connection.db?.databaseName;
    logger.info(`Connected to MongoDB. Using database: ${dbName}`);

    const collections = await mongoose.connection.db
      ?.listCollections()
      .toArray();
    const collectionNames = collections?.map((col) => col.name);

    if (!collectionNames?.includes(TABLE_NAME)) {
      await mongoose.connection.db?.createCollection(TABLE_NAME);
      logger.info(`Created collection: ${TABLE_NAME}`);
    }
  } catch (error: unknown) {
    logger.error(`Failed to connect to MongoDB: ${error}`);
    process.exit(1);
  }
};
