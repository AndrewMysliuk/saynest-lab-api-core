import { IConversationHistory } from "../../../types"

export interface IRepository {
  saveHistory(history_data: Partial<IConversationHistory>): Promise<IConversationHistory>
  getHistoryBySession(session_id: string): Promise<IConversationHistory[]>
  deleteHistoryById(session_id: string, message_id: string): Promise<void>
  deleteHistoryByPairId(session_id: string, pair_id: string): Promise<void>
}
