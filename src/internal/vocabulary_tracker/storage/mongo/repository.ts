import { Types } from "mongoose"

import { IRepository } from ".."
import { IVocabularyEntity } from "../../../../types"
import { VocabularyModel } from "../mongo/model"

export class VocabularyRepository implements IRepository {
  async list(user_id: string): Promise<IVocabularyEntity[]> {
    return VocabularyModel.find({ user_id: new Types.ObjectId(user_id), is_archived: false }).sort({ last_used_at: -1 })
  }

  async getByUserId(user_id: string, word: string): Promise<IVocabularyEntity | null> {
    return VocabularyModel.findOne({
      user_id: new Types.ObjectId(user_id),
      word: word.toLowerCase(),
      is_archived: false,
    })
  }

  async getBySessionId(session_id: string, word: string): Promise<IVocabularyEntity | null> {
    return VocabularyModel.findOne({
      session_id: new Types.ObjectId(session_id),
      word: word.toLowerCase(),
      is_archived: false,
    })
  }

  async set(data: Partial<IVocabularyEntity>): Promise<IVocabularyEntity> {
    if (!data.user_id || !data.word || !data.session_id) {
      throw new Error("Missing required fields: user_id, session_id, word")
    }

    const existing = await VocabularyModel.findOne({
      user_id: data.user_id,
      word: data.word.toLowerCase(),
    })

    if (existing) {
      existing.usage_count += 1
      existing.last_used_at = new Date()
      return await existing.save()
    }

    const now = new Date()

    const created = await VocabularyModel.create({
      ...data,
      word: data.word?.toLowerCase(),
      usage_count: 1,
      first_used_at: now,
      last_used_at: now,
      is_archived: false,
    })

    return created.toObject()
  }
}
