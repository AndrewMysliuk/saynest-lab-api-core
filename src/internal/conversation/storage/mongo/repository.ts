import { IConversationHistory } from "../../../../types"
import { IRepository } from "../index"
import { ConversationHistoryModel } from "./model"

export class HistoryRepository implements IRepository {
  async saveHistory(historyData: Partial<IConversationHistory>): Promise<IConversationHistory> {
    const history = new ConversationHistoryModel(historyData)
    return await history.save()
  }

  async getHistoryBySession(sessionId: string): Promise<IConversationHistory[]> {
    return await ConversationHistoryModel.find({ sessionId }).sort({ createdAt: 1 })
  }

  async deleteHistoryById(sessionId: string, messageId: string): Promise<void> {
    await ConversationHistoryModel.deleteOne({ sessionId, _id: messageId })
  }

  async deleteHistoryByPairId(sessionId: string, pairId: string): Promise<void> {
    await ConversationHistoryModel.deleteMany({ sessionId, pairId })
  }
}
