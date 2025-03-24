import mongoose, { Document, Schema } from "mongoose"

import { IVocabularyEntity, VocabularyFrequencyLevelEnum, VocabularySourceEnum } from "../../../../types"
import { MODEL_NAME as SESSION_TABLE } from "../../../session/storage/mongo/model"
import { MODEL_NAME as USER_TABLE } from "../../../user/storage/mongo/model"

export const MODEL_NAME = "vocabularies"

export type IVocabularyDocument = IVocabularyEntity & Document

const VocabularySchema = new Schema<IVocabularyEntity>({
  user_id: { type: Schema.Types.ObjectId, required: true, ref: USER_TABLE },
  session_id: { type: Schema.Types.ObjectId, required: true, ref: SESSION_TABLE },
  language: { type: String, required: true },
  word: { type: String, required: true },
  translation: { type: String, default: "" },
  part_of_speech: { type: String, default: "" },
  frequency_level: {
    type: String,
    enum: VocabularyFrequencyLevelEnum,
    required: true,
  },
  source: {
    type: String,
    enum: VocabularySourceEnum,
    required: true,
  },
  usage_count: { type: Number, default: 1 },
  first_used_at: { type: Date, default: () => new Date() },
  last_used_at: { type: Date, default: () => new Date() },
  is_archived: { type: Boolean, default: false },
})

export const VocabularyModel = mongoose.model<IVocabularyEntity>(MODEL_NAME, VocabularySchema)
