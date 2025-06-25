import { Types } from "mongoose"

import { IGPTPayload } from "./IGPT"
import { ITTSElevenLabsPayload, ITTSGooglePayload, ITTSPayload } from "./ITTS"

export interface IConversationHistory {
  session_id: Types.ObjectId
  user_id: Types.ObjectId | null
  organization_id: Types.ObjectId | null
  pair_id: string
  role: "system" | "user" | "assistant"
  content: string
  audio_url: string
  audio_path: string
  updated_at: Date
  created_at: Date
}

export interface IConversationWhisper {
  audio_file: Express.Multer.File
  prompt?: string
}

export interface IConversationPayload {
  // organization_id: string
  // user_id: string
  whisper: IConversationWhisper
  gpt_model: IGPTPayload
  // tts: ITTSPayload
  // tts: ITTSElevenLabsPayload
  tts: ITTSGooglePayload
  system: {
    session_id: string
    prompt_id: string
  }
  target_language: string
  explanation_language: string
}

export enum StreamEventEnum {
  TRANSCRIPTION = "TRANSCRIPTION",
  GPT_RESPONSE = "GPT_RESPONSE",
  GPT_FULL_RESPONSE = "GPT_FULL_RESPONSE",
  TTS_CHUNK = "TTS_CHUNK",
  TTS_LINK = "TTS_LINK",
  ERROR = "ERROR",
  COMPLETE = "COMPLETE",
  HEARTBEAT = "HEARTBEAT",
}

export interface IHistoryStreamEvent {
  type: StreamEventEnum.TRANSCRIPTION
  role: "user"
  content: string
  audio_url: string
}

export interface IGptResponseStreamEvent {
  type: StreamEventEnum.GPT_RESPONSE | StreamEventEnum.GPT_FULL_RESPONSE
  role: "assistant"
  content: string
}

// ElevenLabs + OpenAI TTS
export interface ITtsChunkStreamEvent {
  type: StreamEventEnum.TTS_CHUNK
  role: "assistant"
  audioChunk: Buffer
}

// Only Google TTS
export interface ITtsLinkStreamEvent {
  type: StreamEventEnum.TTS_LINK
  role: "assistant"
  audioUrl: string
}

export interface IErrorStreamEvent {
  type: StreamEventEnum.ERROR
  role: "system"
  content: string
}

export interface IHeartbeatStreamEvent {
  type: StreamEventEnum.HEARTBEAT
}

export type ConversationStreamEvent = IHistoryStreamEvent | IGptResponseStreamEvent | ITtsChunkStreamEvent | ITtsLinkStreamEvent | IErrorStreamEvent | IHeartbeatStreamEvent

export interface IConversationResponse {
  session_id: string
  conversation_history: IConversationHistory[]
  last_model_response: string
}
