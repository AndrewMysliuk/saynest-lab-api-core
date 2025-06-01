import { Types } from "mongoose"

import { IRepository } from ".."
import { IMongooseOptions, IUserProgressEntity } from "../../../../types"
import { logger } from "../../../../utils"
import { UserProgressModel } from "./model"

export class UserProgressRepository implements IRepository {
  async createIfNotExists(user_id: Types.ObjectId, organization_id?: Types.ObjectId, options?: IMongooseOptions): Promise<IUserProgressEntity | null> {
    try {
      let progressDoc = await UserProgressModel.findOne({ user_id }, null, options)

      if (!progressDoc) {
        const doc = new UserProgressModel({
          user_id,
          organization_id: organization_id || null,
          total_sessions: 0,
          avg_session_duration: 0,
          total_session_duration: 0,
          cefr_history: [],
          error_stats: [],
          filler_words_usage: [],
          completed_prompts: {},
          tasks: [],
          current_day_streak: 0,
          longest_day_streak: 0,
        })

        await doc.save({ session: options?.session || null })

        progressDoc = doc
      }

      const plain = progressDoc.toObject()

      return plain
    } catch (err) {
      logger.error("[UserProgressRepository.createIfNotExists] error", { error: err, user_id })
      throw err
    }
  }

  async update(data: Partial<IUserProgressEntity>, user_id: Types.ObjectId, options?: IMongooseOptions): Promise<IUserProgressEntity> {
    try {
      const updated = await UserProgressModel.findOneAndUpdate({ user_id }, { $set: { ...data, updated_at: new Date() } }, { new: true, ...options }).lean()

      if (!updated) {
        throw new Error("UserProgress document not found for update")
      }

      return updated
    } catch (err) {
      logger.error("[UserProgressRepository.update] error", { error: err, user_id })
      throw err
    }
  }

  async addActivityDate(user_id: Types.ObjectId, date: string, streakData?: { current_day_streak: number; longest_day_streak?: number }, options?: IMongooseOptions): Promise<void> {
    try {
      const $set: Record<string, any> = {
        [`activity_log.${date}`]: true,
        updated_at: new Date(),
      }

      if (streakData) {
        $set.current_day_streak = streakData.current_day_streak

        if (streakData.longest_day_streak !== undefined) {
          $set.longest_day_streak = streakData.longest_day_streak
        }
      }

      await UserProgressModel.updateOne({ user_id }, { $set }, options)
    } catch (err) {
      logger.error("[UserProgressRepository.addActivityDate] error", { error: err, user_id, date })
      throw err
    }
  }

  async getByUserId(user_id: Types.ObjectId, options?: IMongooseOptions): Promise<IUserProgressEntity | null> {
    try {
      return await UserProgressModel.findOne({ user_id }, null, options).lean()
    } catch (err) {
      logger.error("[UserProgressRepository.getByUserId] error", { error: err, user_id })
      throw err
    }
  }
}
