import OpenAI from "openai"

import { serverConfig } from "./server_config"

export const openaiREST = new OpenAI({
  apiKey: serverConfig.OPENAI_API_KEY,
})
