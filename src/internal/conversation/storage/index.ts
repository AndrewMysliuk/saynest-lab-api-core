import { IConversationHistory } from "../../../types"

export interface IRepository {
  saveHistory(historyData: Partial<IConversationHistory>): Promise<IConversationHistory>
  getHistoryBySession(sessionId: string): Promise<IConversationHistory[]>
  deleteHistoryById(sessionId: string, messageId: string): Promise<void>
  deleteHistoryByPairId(sessionId: string, pairId: string): Promise<void>
}
