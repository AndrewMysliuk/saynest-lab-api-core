import { omit } from "lodash"
import { Types } from "mongoose"

import { IRepository } from ".."
import { IGlobalWord, IMongooseOptions, IPagination, IUserWordListFilters, IUserWordPublic, IUserWordTierEnum } from "../../../../types"
import { createScopedLogger } from "../../../../utils"
import { GlobalWordModel } from "../mongo/global_word_model"
import { UserWordModel } from "../mongo/user_word_model"

const log = createScopedLogger("VocabularyRepository")

export class VocabularyRepository implements IRepository {
  async findByWordAndLangs(word: string, target_language: string, native_language: string, options?: IMongooseOptions): Promise<IGlobalWord | null> {
    try {
      const response = await GlobalWordModel.findOne({ word, target_language, native_language })
        .session(options?.session || null)
        .lean()

      return response
    } catch (error: unknown) {
      log.error("findByWordAndLangs", "error", { error })
      throw error
    }
  }

  async findById(id: string, options?: IMongooseOptions): Promise<IGlobalWord | null> {
    try {
      const response = await GlobalWordModel.findById(id)
        .session(options?.session || null)
        .lean()

      return response
    } catch (error: unknown) {
      log.error("findById", "error", { error })
      throw error
    }
  }

  async createGlobalWord(data: Partial<IGlobalWord>, options?: IMongooseOptions): Promise<IGlobalWord> {
    try {
      const doc = new GlobalWordModel(data)

      const saved = await doc.save({ session: options?.session })
      return saved.toObject()
    } catch (error: unknown) {
      log.error("createGlobalWord", "error", { error })
      throw error
    }
  }

  async updateAudioUrlRequest(id: string, audio_url_request: string, options?: IMongooseOptions): Promise<string> {
    try {
      const updated = await GlobalWordModel.findByIdAndUpdate(id, { $set: { audio_url_request } }, { session: options?.session, new: true, lean: true })

      return updated?.audio_url_request || ""
    } catch (error: unknown) {
      log.error("updateAudioUrlRequest", "error", { error })
      throw error
    }
  }

  async findUserWord(user_id: string, global_word_id: string, options?: IMongooseOptions): Promise<IUserWordPublic | null> {
    try {
      const response = await UserWordModel.findOne({ user_id, global_word_id })
        .populate("global_word_id")
        .session(options?.session || null)
        .lean()

      if (!response) return null

      const { global_word_id: fullWord, ...rest } = response

      const result: IUserWordPublic = {
        ...rest,
        global_word_entity: omit(fullWord, ["__v", "created_at", "updated_at"]),
      }
      return result
    } catch (error: unknown) {
      log.error("findUserWord", "error", { error })
      throw error
    }
  }

  async createUserWord(user_id: string, global_word_id: string, tier: IUserWordTierEnum, options?: IMongooseOptions): Promise<IUserWordPublic> {
    try {
      const doc = new UserWordModel({ user_id, global_word_id, tier })
      const saved = await doc.save({ session: options?.session })

      const populated = await UserWordModel.findById(saved._id)
        .populate("global_word_id")
        .session(options?.session || null)
        .lean()

      if (!populated) throw new Error("UserWord not found after creation")

      const { global_word_id: fullWord, ...rest } = populated

      const result: IUserWordPublic = {
        ...rest,
        global_word_entity: omit(fullWord, ["__v", "created_at", "updated_at"]),
      }

      return result
    } catch (error: unknown) {
      log.error("createUserWord", "error", { error })
      throw error
    }
  }

  async updateTier(user_word_id: string, tier: IUserWordTierEnum, options?: IMongooseOptions): Promise<IUserWordPublic> {
    try {
      const updated = await UserWordModel.findByIdAndUpdate(user_word_id, { $set: { tier } }, { session: options?.session, new: true, lean: true }).populate("global_word_id").lean()

      if (!updated) throw new Error("UserWord not found")

      const { global_word_id: fullWord, ...rest } = updated

      const result: IUserWordPublic = {
        ...rest,
        global_word_entity: omit(fullWord, ["__v", "created_at", "updated_at"]),
      }

      return result
    } catch (error: unknown) {
      log.error("updateTier", "error", { error })
      throw error
    }
  }

  async deleteUserWord(user_id: string, global_word_id: string, options?: IMongooseOptions): Promise<void> {
    try {
      await UserWordModel.deleteOne({ user_id, global_word_id }).session(options?.session || null)
    } catch (error: unknown) {
      log.error("deleteUserWord", "error", { error })
      throw error
    }
  }

  async listUserWords(user_id: string, filters: IUserWordListFilters, pagination?: IPagination, options?: IMongooseOptions): Promise<IUserWordPublic[]> {
    try {
      const matchStage: any = { user_id: new Types.ObjectId(user_id) }

      if (filters.tier?.length) {
        matchStage["tier"] = { $in: filters.tier }
      }

      const needsLookup = !!filters.word || !!filters.native_language || !!filters.target_language

      if (needsLookup) {
        const pipeline: any[] = [
          { $match: matchStage },
          {
            $lookup: {
              from: "global_words",
              localField: "global_word_id",
              foreignField: "_id",
              as: "global_word_entity",
            },
          },
          { $unwind: "$global_word_entity" },
        ]

        const subMatch: any = {}

        if (filters.native_language) {
          subMatch["global_word_entity.native_language"] = filters.native_language
        }

        if (filters.target_language) {
          subMatch["global_word_entity.target_language"] = filters.target_language
        }

        if (filters.word) {
          subMatch["global_word_entity.word"] = {
            $regex: filters.word,
            $options: "i",
          }
        }

        if (Object.keys(subMatch).length > 0) {
          pipeline.push({ $match: subMatch })
        }

        pipeline.push(
          { $sort: { created_at: -1 } },
          { $skip: pagination?.offset ?? 0 },
          { $limit: pagination?.limit ?? 20 },
          {
            $project: {
              __v: 0,
              "global_word_entity.__v": 0,
              "global_word_entity.created_at": 0,
              "global_word_entity.updated_at": 0,
            },
          },
        )

        const results = await UserWordModel.aggregate(pipeline).option({ session: options?.session || null })

        return results.map(({ global_word_entity, ...rest }) => ({
          ...rest,
          global_word_entity,
        }))
      }

      const rawResults = await UserWordModel.find(matchStage)
        .sort({ created_at: -1 })
        .skip(pagination?.offset || 0)
        .limit(pagination?.limit || 20)
        .populate("global_word_id")
        .session(options?.session || null)
        .lean()

      return rawResults.map((doc) => {
        const { global_word_id, ...rest } = doc

        const result: IUserWordPublic = {
          ...rest,
          global_word_entity: omit(global_word_id, ["__v", "created_at", "updated_at"]),
        }

        return result
      })
    } catch (error: unknown) {
      log.error("listUserWords", "error", { error })
      throw error
    }
  }

  async getUserWord(user_id: string, options?: IMongooseOptions): Promise<IUserWordPublic | null> {
    try {
      const response = await UserWordModel.findOne({ user_id })
        .populate("global_word_id")
        .session(options?.session || null)
        .lean()

      if (!response) return null

      const { global_word_id, ...rest } = response

      const result: IUserWordPublic = {
        ...rest,
        global_word_entity: omit(global_word_id, ["__v", "created_at", "updated_at"]),
      }

      return result
    } catch (error: unknown) {
      log.error("getUserWord", "error", { error })
      throw error
    }
  }
}
