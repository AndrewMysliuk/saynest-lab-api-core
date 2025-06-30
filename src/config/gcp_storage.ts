import { Bucket, Storage } from "@google-cloud/storage"
import path from "path"

import { serverConfig } from "./server_config"

const isRunningInGCP = process.env.K_SERVICE !== undefined

const gcs = isRunningInGCP
  ? new Storage()
  : new Storage({
      keyFilename: path.resolve(__dirname, "../../speak-mate-mvp-5f8c7bbc58d1.json"),
    })

export const gcsConversationBucket = gcs.bucket(serverConfig.GCS_BUCKET_NAME)
export const gcsVocabularyBucket = gcs.bucket(serverConfig.GCS_VOCABULARY_BUCKET_NAME)

export async function getSignedUrlFromBucket(bucket: Bucket, filePath: string, expiresInMs = 5 * 60 * 1000): Promise<string> {
  const file = bucket.file(filePath)

  const [signedUrl] = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + expiresInMs,
  })

  return signedUrl
}
