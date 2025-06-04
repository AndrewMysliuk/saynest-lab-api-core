import { connectToDatabase, disconnectFromDatabase } from "../config"
import { logger } from "../utils"
import { runMigration as run001 } from "./001_create_user_progress"
import { runMigration as run002 } from "./002_update_user_settings_legal"

async function main() {
  try {
    await connectToDatabase()

    await run001()
    logger.info("Migration 001 completed")

    await run002()
    logger.info("Migration 002 completed")
  } catch (error) {
    logger.error(`Migration failed: ${error}`)
  } finally {
    await disconnectFromDatabase()
  }
}

main()
