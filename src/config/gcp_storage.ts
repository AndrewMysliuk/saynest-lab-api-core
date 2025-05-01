import { Storage } from "@google-cloud/storage"
import path from "path"

import { serverConfig } from "./server_config"

const keyPath = path.resolve(__dirname, "../../speak-mate-mvp-5f8c7bbc58d1.json")

export const gcs = new Storage({
  keyFilename: keyPath,
})

export const gcsBucket = gcs.bucket(serverConfig.GCS_BUCKET_NAME)

export async function getSignedUrlFromStoragePath(storagePath: string, expiresInMs = 60 * 60 * 1000): Promise<string> {
  const file = gcsBucket.file(storagePath)

  const [signedUrl] = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + expiresInMs,
  })

  return signedUrl
}
