import mongoose, { Document, Schema } from "mongoose"

import { IMeaningEntity, IVocabularyEntity, PartOfSpeechEnum, VocabularyFrequencyLevelEnum } from "../../../../types"
import { MODEL_NAME as ORGANISATION_TABLE } from "../../../organisation/storage/mongo/model"
import { MODEL_NAME as SESSION_TABLE } from "../../../session/storage/mongo/model"
import { MODEL_NAME as USER_TABLE } from "../../../user/storage/mongo/model"

export const MODEL_NAME = "vocabularies"

export type IVocabularyDocument = IVocabularyEntity & Document

const MeaningSchema = new Schema<IMeaningEntity>(
  {
    part_of_speech: {
      type: String,
      enum: Object.values(PartOfSpeechEnum),
      required: true,
    },
    translation: { type: String, required: true },
    meaning: { type: String, required: true },
    synonyms: { type: [String], default: [] },
  },
  { _id: false },
)

const VocabularySchema = new Schema<IVocabularyDocument>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: USER_TABLE, required: true },
    organization_id: { type: Schema.Types.ObjectId, ref: ORGANISATION_TABLE, required: true },
    session_id: { type: Schema.Types.ObjectId, required: true, ref: SESSION_TABLE },
    target_language: { type: String, required: true },
    explanation_language: { type: String, required: true },
    word: { type: String, required: true },
    frequency_level: { type: String, enum: Object.values(VocabularyFrequencyLevelEnum), required: true },
    meanings: { type: [MeaningSchema], required: true },
    audio_base64: { type: String, default: null },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
)

VocabularySchema.index({ word: 1, target_language: 1, explanation_language: 1, user_id: 1 }, { unique: true })

export const VocabularyModel = mongoose.model<IVocabularyDocument>(MODEL_NAME, VocabularySchema)
