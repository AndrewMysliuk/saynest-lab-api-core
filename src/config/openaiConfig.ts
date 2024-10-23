import WebSocket from "ws"
import OpenAI from "openai"
import { serverConfig } from "./serverConfig"

export const REALTIME_BETA_MODEL_URL = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01"

export const openaiREST = new OpenAI({
  apiKey: serverConfig.OPENAI_API_KEY,
})

export const openaiWSOptions: WebSocket.ClientOptions = {
  headers: {
    Authorization: "Bearer " + serverConfig.OPENAI_API_KEY,
    "OpenAI-Beta": "realtime=v1",
  },
}
