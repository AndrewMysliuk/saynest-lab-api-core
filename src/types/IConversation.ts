import { IGPTPayload } from "./IGPT"
import { ITTSPayload } from "./ITTS"

export interface IConversationHistory {
  session_id: string
  pair_id: string
  role: "system" | "user" | "assistant"
  content: string
  audio_url?: string
  created_at: Date
}

export interface IConversationWhisper {
  audio_file: Express.Multer.File
  prompt?: string
}

export interface IConversationPayload {
  whisper: IConversationWhisper
  gpt_model: IGPTPayload
  tts: ITTSPayload
  system: {
    session_id?: string
    global_prompt: string
  }
}

export interface IConversationResponse {
  session_id: string
  conversation_history: IConversationHistory[]
}
