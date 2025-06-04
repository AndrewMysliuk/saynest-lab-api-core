import { IConversationHistory, IMongooseOptions } from "../../../types"

export interface IRepository {
  saveMany(historyArray: Partial<IConversationHistory>[], options?: IMongooseOptions): Promise<IConversationHistory[]>
  saveHistory(history_data: Partial<IConversationHistory>, options?: IMongooseOptions): Promise<IConversationHistory>
  getHistoryBySession(session_id: string, options?: IMongooseOptions): Promise<IConversationHistory[]>
  deleteAllBySessionId(session_id: string, options?: IMongooseOptions): Promise<void>
  deleteAllByUserId(user_id: string, options?: IMongooseOptions): Promise<void>
}
