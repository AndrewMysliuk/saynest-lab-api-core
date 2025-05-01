import { ClientSession } from "mongoose"

export interface IServerConfig {
  PORT?: number
  OPENAI_API_KEY: string
  MONGO_URI: string
  ELEVEN_API_KEY: string
  ACCESS_TOKEN_SECRET: string
  CAPTCHA_SITE_KEY: string
  GCS_BUCKET_NAME: string
}

export interface IMongooseOptions {
  session?: ClientSession
}

export interface IStorageOptions {
  session_id?: string
  organization_id?: string | null
  user_id?: string | null
}
