import { IConversationHistory, IMongooseOptions } from "../../../../types"
import { logger } from "../../../../utils"
import { IRepository } from "../index"
import { ConversationHistoryModel } from "./model"

export class HistoryRepository implements IRepository {
  async saveMany(historyArray: Partial<IConversationHistory>[], options?: IMongooseOptions): Promise<IConversationHistory[]> {
    try {
      const models = historyArray.map((data) => new ConversationHistoryModel(data))

      return ConversationHistoryModel.insertMany(models, {
        session: options?.session,
        ordered: true,
      })
    } catch (error: unknown) {
      logger.error(`saveMany | error: ${error}`)
      throw error
    }
  }

  async saveHistory(history_data: Partial<IConversationHistory>, options?: IMongooseOptions): Promise<IConversationHistory> {
    try {
      const history = new ConversationHistoryModel(history_data)
      return history.save({ session: options?.session })
    } catch (error: unknown) {
      logger.error(`saveHistory | error: ${error}`)
      throw error
    }
  }

  async getHistoryBySession(session_id: string, options?: IMongooseOptions): Promise<IConversationHistory[]> {
    try {
      return ConversationHistoryModel.find({ session_id })
        .sort({
          created_at: 1,
        })
        .session(options?.session || null)
    } catch (error: unknown) {
      logger.error(`getHistoryBySession | error: ${error}`)
      throw error
    }
  }

  async deleteAllBySessionId(session_id: string, options?: IMongooseOptions): Promise<void> {
    try {
      await ConversationHistoryModel.deleteMany({ session_id }).session(options?.session || null)

      return
    } catch (error: unknown) {
      logger.error(`deleteAllBySessionId | error: ${error}`)
      throw error
    }
  }

  async deleteAllByUserId(user_id: string, options?: IMongooseOptions): Promise<void> {
    try {
      await ConversationHistoryModel.deleteMany({ user_id }).session(options?.session || null)

      return
    } catch (error: unknown) {
      logger.error(`deleteAllBySessionId | error: ${error}`)
      throw error
    }
  }
}
