import { ObjectId } from "mongoose"

import { ConversationStreamEvent, IConversationHistory, IConversationPayload, IConversationResponse } from "../../types"

export interface IConversationService {
  streamConversation(payload: IConversationPayload, outputConversation?: { finalData?: IConversationResponse }): AsyncGenerator<ConversationStreamEvent>
  startNewSession(
    // organization_id: string,
    // user_id: string,
    system_prompt: string,
    session_dir: string,
  ): Promise<{
    session_id: ObjectId
    conversation_history: IConversationHistory[]
  }>
  getSessionData(
    // organization_id: string,
    // user_id: string,
    session_id: string | undefined,
    system_prompt: string,
    session_dir: string,
  ): Promise<{
    session_id: ObjectId
    conversation_history: IConversationHistory[]
  }>
  listConversationHistory(session_id: string): Promise<IConversationHistory[]>
}
