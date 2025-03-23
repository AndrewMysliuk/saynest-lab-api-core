import { ObjectId } from "mongoose"

import { IConversationHistory, IConversationPayload, IConversationResponse } from "../../types"

export interface IConversationService {
  processConversation(payload: IConversationPayload, onData: (role: string, content: string, audio_url?: string, audio_chunk?: Buffer) => void): Promise<IConversationResponse>
  startNewSession(system_prompt: string): Promise<{
    session_id: ObjectId
    session_directory: string
    conversation_history: IConversationHistory[]
  }>
  getSessionData(
    session_id: string | undefined,
    system_prompt: string,
  ): Promise<{
    session_id: ObjectId
    session_directory: string
    conversation_history: IConversationHistory[]
  }>
}
