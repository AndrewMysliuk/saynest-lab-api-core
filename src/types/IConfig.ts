import { ClientSession } from "mongoose"

export interface IServerConfig {
  PORT?: number
  OPENAI_API_KEY: string
  MONGO_URI: string
  ELEVEN_API_KEY: string
}

export interface IMongooseOptions {
  session?: ClientSession
}
