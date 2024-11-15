import { IGPTPayload } from "./IGPT"
import { ITTSPayload } from "./ITTS"

export interface IConversationWhisper {
  audioFile: Express.Multer.File
  prompt?: string
}

export interface IConversationPayload {
  whisper: IConversationWhisper
  gpt_model: IGPTPayload
  tts: ITTSPayload
  system: {
    sessionId?: string
    globalPrompt: string
  }
}
