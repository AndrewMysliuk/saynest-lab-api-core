import { Types } from "mongoose"

import { IRepository } from ".."
import { IVocabularyEntity, IWordExplanationRequest } from "../../../../types"
import { VocabularyModel } from "../mongo/model"

export class VocabularyRepository implements IRepository {
  async list(): Promise<IVocabularyEntity[]> {
    return VocabularyModel.find()
  }

  async getBySessionId(session_id: string): Promise<IVocabularyEntity[] | null> {
    if (!Types.ObjectId.isValid(session_id)) return null

    return VocabularyModel.find({
      session_id: new Types.ObjectId(session_id),
    })
  }

  async getByWord({ word, language, translation_language }: IWordExplanationRequest): Promise<IVocabularyEntity | null> {
    return VocabularyModel.findOne({ word, language, translation_language })
  }

  async create(data: IVocabularyEntity): Promise<IVocabularyEntity> {
    return VocabularyModel.create(data)
  }

  async patchAudio(id: string, audio_base64: string | null): Promise<IVocabularyEntity> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid ID")
    }

    const updated = await VocabularyModel.findByIdAndUpdate(id, { audio_base64 }, { new: true })

    if (!updated) {
      throw new Error("Vocabulary entry not found")
    }

    return updated.toObject()
  }

  async delete(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid ID")
    }

    await VocabularyModel.findByIdAndDelete(id)
  }
}
