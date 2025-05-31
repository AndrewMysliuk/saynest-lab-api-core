import { IRepository } from "../"
import { ICommunicationReview, ICommunicationReviewFilters, IMongooseOptions, IPagination } from "../../../../types"
import { logger } from "../../../../utils"
import { StatisticsModel } from "./model"

export class CommunicationReviewRepository implements IRepository {
  async get(id: string, user_id: string, options?: IMongooseOptions): Promise<ICommunicationReview | null> {
    try {
      return StatisticsModel.findOne({ _id: id, user_id }).session(options?.session || null)
    } catch (error: unknown) {
      logger.error(`get | error: ${error}`)
      throw error
    }
  }

  async getBySessionId(session_id: string, options?: IMongooseOptions): Promise<ICommunicationReview | null> {
    try {
      return StatisticsModel.findOne({ session_id }).session(options?.session || null)
    } catch (error: unknown) {
      logger.error(`getBySessionId | error: ${error}`)
      throw error
    }
  }

  async list(user_id: string, filter?: ICommunicationReviewFilters, pagination?: IPagination, options?: IMongooseOptions): Promise<ICommunicationReview[]> {
    try {
      const query: any = { user_id }

      if (filter?.from_date || filter?.to_date) {
        query.created_at = {}
        if (filter.from_date) query.created_at.$gte = filter.from_date
        if (filter.to_date) query.created_at.$lte = filter.to_date
      }

      return StatisticsModel.find(query, {}, options)
        .sort({ created_at: -1 })
        .skip(pagination?.offset || 0)
        .limit(pagination?.limit || 20)
        .session(options?.session || null)
    } catch (error: unknown) {
      logger.error(`list | error: ${error}`)
      throw error
    }
  }

  async add(statistics: Partial<ICommunicationReview>, options?: IMongooseOptions): Promise<ICommunicationReview> {
    try {
      const created = new StatisticsModel(statistics)

      return created.save({ session: options?.session })
    } catch (error: unknown) {
      logger.error(`add | error: ${error}`)
      throw error
    }
  }

  async update(id: string, user_id: string, updates: Partial<ICommunicationReview>, options?: IMongooseOptions): Promise<ICommunicationReview | null> {
    try {
      return await StatisticsModel.findOneAndUpdate(
        { _id: id, user_id },
        { $set: updates },
        {
          new: true,
          session: options?.session,
        },
      )
    } catch (error) {
      logger.error(`updateByIdAndUser | error: ${error}`)
      throw error
    }
  }

  async delete(id: string, user_id: string, options?: IMongooseOptions): Promise<ICommunicationReview | null> {
    try {
      return StatisticsModel.findOneAndDelete({ _id: id, user_id }).session(options?.session || null)
    } catch (error: unknown) {
      logger.error(`delete | error: ${error}`)
      throw error
    }
  }
}
