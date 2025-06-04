import { Types } from "mongoose"

import { IRepository } from ".."
import { IMongooseOptions, IVocabularyEntity, IWordExplanationRequest } from "../../../../types"
import { logger } from "../../../../utils"
import { VocabularyModel } from "../mongo/model"

export class VocabularyRepository implements IRepository {
  async list(options?: IMongooseOptions): Promise<IVocabularyEntity[]> {
    try {
      return VocabularyModel.find().session(options?.session || null)
    } catch (error: unknown) {
      logger.error(`list | error: ${error}`)
      throw error
    }
  }

  async listBySessionId(session_id: string, options?: IMongooseOptions): Promise<IVocabularyEntity[] | null> {
    try {
      if (!Types.ObjectId.isValid(session_id)) return null

      return VocabularyModel.find({
        session_id: new Types.ObjectId(session_id),
      }).session(options?.session || null)
    } catch (error: unknown) {
      logger.error(`listBySessionId | error: ${error}`)
      throw error
    }
  }

  async getByWord({ word, target_language, explanation_language }: IWordExplanationRequest, options?: IMongooseOptions): Promise<IVocabularyEntity | null> {
    try {
      return VocabularyModel.findOne({ word, target_language, explanation_language }).session(options?.session || null)
    } catch (error: unknown) {
      logger.error(`getByWord | error: ${error}`)
      throw error
    }
  }

  async create(data: Partial<IVocabularyEntity>, options?: IMongooseOptions): Promise<IVocabularyEntity | null> {
    try {
      try {
        const vocab = new VocabularyModel(data)
        await vocab.save({ session: options?.session })
        return vocab.toObject()
      } catch (error: any) {
        if (error && typeof error === "object" && (error as any).code === 11000) {
          console.warn("Duplicate vocabulary entry skipped:", data)
          return null
        }

        throw error
      }
    } catch (error: unknown) {
      logger.error(`create | error: ${error}`)
      throw error
    }
  }

  async patchAudio(id: string, audio_base64: string | null, options?: IMongooseOptions): Promise<IVocabularyEntity> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new Error("Invalid ID")
      }

      const updated = await VocabularyModel.findByIdAndUpdate(id, { audio_base64 }, { new: true }).session(options?.session || null)

      if (!updated) {
        throw new Error("Vocabulary entry not found")
      }

      return updated.toObject()
    } catch (error: unknown) {
      logger.error(`patchAudio | error: ${error}`)
      throw error
    }
  }

  async delete(id: string, options?: IMongooseOptions): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new Error("Invalid ID")
      }

      await VocabularyModel.findByIdAndDelete(id).session(options?.session || null)
    } catch (error: unknown) {
      logger.error(`delete | error: ${error}`)
      throw error
    }
  }

  async deleteAllBySessionId(session_id: string, options?: IMongooseOptions): Promise<void> {
    try {
      await VocabularyModel.deleteMany({ session_id }).session(options?.session || null)

      return
    } catch (error: unknown) {
      logger.error(`deleteAllBySessionId | error: ${error}`)
      throw error
    }
  }

  async deleteAllByUserId(user_id: string, options?: IMongooseOptions): Promise<void> {
    try {
      await VocabularyModel.deleteMany({ user_id }).session(options?.session || null)

      return
    } catch (error: unknown) {
      logger.error(`deleteAllByUserId | error: ${error}`)
      throw error
    }
  }
}
