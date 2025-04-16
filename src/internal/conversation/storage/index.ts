import { IConversationHistory, IMongooseOptions } from "../../../types"

export interface IRepository {
  saveMany(historyArray: Partial<IConversationHistory>[], options?: IMongooseOptions): Promise<IConversationHistory[]>
  saveHistory(history_data: Partial<IConversationHistory>, options?: IMongooseOptions): Promise<IConversationHistory>
  getHistoryBySession(session_id: string, options?: IMongooseOptions): Promise<IConversationHistory[]>
  deleteHistoryById(session_id: string, message_id: string, options?: IMongooseOptions): Promise<void>
  deleteHistoryByPairId(session_id: string, pair_id: string, options?: IMongooseOptions): Promise<void>
}
