import fs from "fs"
import path from "path"

import logger from "./logger"

export const ensureStorageDirExists = async (session_id?: string): Promise<string> => {
  const baseDirectory = path.join(process.cwd(), "user_sessions")
  const session_directory = session_id ? path.join(baseDirectory, session_id) : baseDirectory

  try {
    await fs.promises.mkdir(session_directory, { recursive: true })
  } catch (err) {
    const error = err as NodeJS.ErrnoException
    logger.error(`[FS] Failed to create session dir: ${error.message}`)
    throw error
  }

  return session_directory
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i]
}
