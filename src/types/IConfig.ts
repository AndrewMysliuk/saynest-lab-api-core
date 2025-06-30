import { ClientSession } from "mongoose"

import { IUserJWTPayload } from "./IUser"

export interface IServerConfig {
  PORT?: string
  OPENAI_API_KEY: string
  MONGO_URI: string
  MONGO_LOCAL_URI: string
  ELEVEN_API_KEY: string
  ACCESS_TOKEN_SECRET: string
  HCAPTCHA_SECRET_KEY: string
  GCS_BUCKET_NAME: string
  GCS_VOCABULARY_BUCKET_NAME: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  PADDLE_API_KEY: string
  PADDLE_WEBHOOK_SECRET: string
}

export interface IMongooseOptions {
  session?: ClientSession
}

export interface IStorageOptions {
  session_id?: string
  organization_id?: string | null
  user_id?: string | null
}

export interface IPagination {
  limit: number
  offset: number
}

declare global {
  namespace Express {
    interface Request {
      user?: IUserJWTPayload
    }
  }
}
