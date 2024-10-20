import OpenAI from "openai"
import { serverConfig } from "./serverConfig"

export const openai = new OpenAI({
  apiKey: serverConfig.OPENAI_API_KEY,
})
