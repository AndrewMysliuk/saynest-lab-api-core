import fs from "fs"
import path from "path"

import { IStorageOptions } from "../types"
import logger from "./logger"

export const ensureStorageDirExists = async (options: IStorageOptions): Promise<string> => {
  const baseDirectory = path.join(process.cwd(), "user_sessions")

  const parts = []

  if (options.organization_id) {
    parts.push(`org-${options.organization_id}`)
  }

  if (options.user_id) {
    parts.push(`user-${options.user_id}`)
  }

  if (options.session_id) {
    parts.push(`session-${options.session_id}`)
  }

  const sessionDirectory = path.join(baseDirectory, ...parts)

  try {
    await fs.promises.mkdir(sessionDirectory, { recursive: true })
  } catch (err) {
    const error = err as NodeJS.ErrnoException
    logger.error(`[FS] Failed to create session dir: ${error.message}`)
    throw error
  }

  return sessionDirectory
}

export const generateFileName = (type: "user-request" | "model-response", extension: string): string => {
  return `${Date.now()}-${type}.${extension}`
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i]
}
