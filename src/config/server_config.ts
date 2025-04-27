import dotenv from "dotenv"

import { IServerConfig } from "../types"

dotenv.config()

export const serverConfig: IServerConfig = {
  PORT: parseInt(process.env.PORT ?? "3001", 10),
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
  MONGO_URI: process.env.MONGO_URI ?? "",
  ELEVEN_API_KEY: process.env.ELEVENLABS_API_KEY ?? "",
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET ?? "your-access-token-secret"
}
