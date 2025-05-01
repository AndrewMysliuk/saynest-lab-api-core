import { IStorageOptions } from "../types"

export const getStorageFilePath = (options: IStorageOptions): string => {
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

  const envPrefix = process.env.NODE_ENV === "production" ? "prod" : "dev"
  return parts.length > 0 ? `${envPrefix}/${parts.join("/")}` : envPrefix
}

export const generateFileName = (type: "user-request" | "model-response", extension: string): string => {
  return `${Date.now()}-${type}.${extension}`
}
