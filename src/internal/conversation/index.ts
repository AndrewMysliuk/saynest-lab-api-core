import { Types } from "mongoose"

import { ConversationStreamEvent, IConversationHistory, IConversationPayload, IConversationResponse, IMongooseOptions } from "../../types"

export interface IConversationService {
  streamConversation(
    payload: IConversationPayload,
    organization_id: string | null,
    user_id: string | null,
    outputConversation?: { finalData?: IConversationResponse },
  ): AsyncGenerator<ConversationStreamEvent>
  getSessionData(session_id: string): Promise<{ session_id: Types.ObjectId; finally_prompt: string; conversation_history: IConversationHistory[] }>
  listConversationHistory(session_id: string): Promise<IConversationHistory[]>
  deleteAllBySessionId(session_id: string): Promise<void>
  deleteAllByUserId(user_id: string, options?: IMongooseOptions): Promise<void>
}
