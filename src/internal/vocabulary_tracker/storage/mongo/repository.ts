import { Types } from "mongoose"

import { IRepository } from ".."
import { IMongooseOptions, IVocabularyEntity, IWordExplanationRequest } from "../../../../types"
import { VocabularyModel } from "../mongo/model"

export class VocabularyRepository implements IRepository {
  async list(options?: IMongooseOptions): Promise<IVocabularyEntity[]> {
    return VocabularyModel.find().session(options?.session || null)
  }

  async listBySessionId(session_id: string, options?: IMongooseOptions): Promise<IVocabularyEntity[] | null> {
    if (!Types.ObjectId.isValid(session_id)) return null

    return VocabularyModel.find({
      session_id: new Types.ObjectId(session_id),
    }).session(options?.session || null)
  }

  async getByWord({ word, language, translation_language }: IWordExplanationRequest, options?: IMongooseOptions): Promise<IVocabularyEntity | null> {
    return VocabularyModel.findOne({ word, language, translation_language }).session(options?.session || null)
  }

  async create(data: IVocabularyEntity, options?: IMongooseOptions): Promise<IVocabularyEntity> {
    const vocab = new VocabularyModel(data)
    await vocab.save({ session: options?.session })
    return vocab.toObject()
  }

  async patchAudio(id: string, audio_base64: string | null, options?: IMongooseOptions): Promise<IVocabularyEntity> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid ID")
    }

    const updated = await VocabularyModel.findByIdAndUpdate(id, { audio_base64 }, { new: true }).session(options?.session || null)

    if (!updated) {
      throw new Error("Vocabulary entry not found")
    }

    return updated.toObject()
  }

  async delete(id: string, options?: IMongooseOptions): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid ID")
    }

    await VocabularyModel.findByIdAndDelete(id).session(options?.session || null)
  }
}
