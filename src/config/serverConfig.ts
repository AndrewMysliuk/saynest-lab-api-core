import dotenv from "dotenv"
import { IServerConfig } from "../types"

// if (process.env.NODE_ENV !== "production") {
//   dotenv.config()
// }

dotenv.config()

export const serverConfig: IServerConfig = {
  PORT: parseInt(process.env.PORT ?? "3001", 10),
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
}
