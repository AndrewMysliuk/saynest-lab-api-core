import { IConversationHistory, IMongooseOptions } from "../../../../types"
import { IRepository } from "../index"
import { ConversationHistoryModel } from "./model"

export class HistoryRepository implements IRepository {
  async saveMany(historyArray: Partial<IConversationHistory>[], options?: IMongooseOptions): Promise<IConversationHistory[]> {
    const models = historyArray.map((data) => new ConversationHistoryModel(data))

    return ConversationHistoryModel.insertMany(models, {
      session: options?.session,
      ordered: true,
    })
  }

  async saveHistory(history_data: Partial<IConversationHistory>, options?: IMongooseOptions): Promise<IConversationHistory> {
    const history = new ConversationHistoryModel(history_data)
    return history.save({ session: options?.session })
  }

  async getHistoryBySession(session_id: string, options?: IMongooseOptions): Promise<IConversationHistory[]> {
    return ConversationHistoryModel.find({ session_id })
      .sort({
        created_at: 1,
      })
      .session(options?.session || null)
  }

  async deleteAllBySessionId(session_id: string, options?: IMongooseOptions): Promise<void> {
    await ConversationHistoryModel.deleteMany({ session_id }).session(options?.session || null)

    return
  }
}
