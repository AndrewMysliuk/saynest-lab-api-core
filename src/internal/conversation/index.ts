import { Types } from "mongoose"

import { ConversationStreamEvent, IConversationHistory, IConversationPayload, IConversationResponse } from "../../types"

export interface IConversationService {
  streamConversation(
    payload: IConversationPayload,
    user_id: string | null,
    organization_id: string | null,
    outputConversation?: { finalData?: IConversationResponse },
  ): AsyncGenerator<ConversationStreamEvent>
  getSessionData(session_id: string): Promise<{ session_id: Types.ObjectId; conversation_history: IConversationHistory[] }>
  listConversationHistory(session_id: string): Promise<IConversationHistory[]>
  deleteAllBySessionId(session_id: string): Promise<void>
}
