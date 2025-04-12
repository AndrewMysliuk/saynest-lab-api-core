import { IConversationHistory, IMongooseOptions } from "../../../../types"
import { IRepository } from "../index"
import { ConversationHistoryModel } from "./model"

export class HistoryRepository implements IRepository {
  async saveHistory(history_data: Partial<IConversationHistory>, options?: IMongooseOptions): Promise<IConversationHistory> {
    const history = new ConversationHistoryModel(history_data)
    return await history.save({ session: options?.session })
  }

  async getHistoryBySession(session_id: string, options?: IMongooseOptions): Promise<IConversationHistory[]> {
    return await ConversationHistoryModel.find({ session_id })
      .sort({
        created_at: 1,
      })
      .session(options?.session || null)
  }

  async deleteHistoryById(session_id: string, message_id: string, options?: IMongooseOptions): Promise<void> {
    await ConversationHistoryModel.deleteOne({ session_id, _id: message_id }).session(options?.session || null)
  }

  async deleteHistoryByPairId(session_id: string, pair_id: string, options?: IMongooseOptions): Promise<void> {
    await ConversationHistoryModel.deleteMany({ session_id, pair_id }).session(options?.session || null)
  }
}
