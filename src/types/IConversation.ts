import { ObjectId } from "mongoose"

import { IGPTPayload } from "./IGPT"
import { ITTSElevenLabsPayload, ITTSPayload } from "./ITTS"

export interface IConversationHistory {
  session_id: ObjectId
  pair_id: string
  role: "system" | "user" | "assistant"
  content: string
  audio_url?: string
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
  tts: ITTSPayload
  // tts: ITTSElevenLabsPayload
  system: {
    session_id: string
    global_prompt: string
    prompt_id: string
  }
}

export enum StreamEventEnum {
  TRANSCRIPTION = "TRANSCRIPTION",
  GPT_RESPONSE = "GPT_RESPONSE",
  GPT_FULL_RESPONSE = "GPT_FULL_RESPONSE",
  TTS_CHUNK = "TTS_CHUNK",
  ERROR = "ERROR",
  COMPLETE = "COMPLETE",
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

export interface ITtsChunkStreamEvent {
  type: StreamEventEnum.TTS_CHUNK
  role: "assistant"
  audioChunk: Buffer
}

export interface IErrorStreamEvent {
  type: StreamEventEnum.ERROR
  role: "system"
  content: string
}

export type ConversationStreamEvent = IHistoryStreamEvent | IGptResponseStreamEvent | ITtsChunkStreamEvent | IErrorStreamEvent

export interface IConversationResponse {
  session_id: string
  conversation_history: IConversationHistory[]
  last_model_response: string
}
