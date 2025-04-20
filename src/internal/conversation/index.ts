import { ObjectId } from "mongoose"

import { ConversationStreamEvent, IConversationHistory, IConversationPayload, IConversationResponse } from "../../types"

export interface IConversationService {
  streamConversation(payload: IConversationPayload, outputConversation?: { finalData?: IConversationResponse }): AsyncGenerator<ConversationStreamEvent>
  getSessionData(
    // organization_id: string,
    // user_id: string,
    session_id: string,
  ): Promise<{
    session_id: ObjectId
    conversation_history: IConversationHistory[]
  }>
  listConversationHistory(session_id: string): Promise<IConversationHistory[]>
}
