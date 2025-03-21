import { IConversationHistory, IConversationPayload, IConversationResponse } from "../../types"

export interface IConversationService {
  processConversation(
    payload: IConversationPayload,
    onData: (role: string, content: string, audioUrl?: string, audioChunk?: Buffer) => void
  ): Promise<IConversationResponse>
  startNewSession(system_prompt: string): Promise<{ session_id: string; sessionDir: string; conversationHistory: IConversationHistory[] }>
  getSessionData(
    session_id: string | undefined,
    system_prompt: string
  ): Promise<{ session_id: string; sessionDir: string; conversationHistory: IConversationHistory[] }>
}
