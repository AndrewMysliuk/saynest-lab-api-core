import mongoose, { Document, Schema } from "mongoose"

import { IGlobalWord, IGlobalWordSenses, PartOfSpeechEnum } from "../../../../types"

export const MODEL_NAME = "global_words"
export type IGlobalWordDocument = IGlobalWord & Document

const GlobalWordSensesSchema = new Schema<IGlobalWordSenses>(
  {
    translations: { type: [String], default: [] },
    definitions: { type: [String], default: [] },
    examples: { type: [String], default: [] },
    synonyms: { type: [String], default: [] },
  },
  { _id: false },
)

const GlobalWordSchema = new Schema<IGlobalWordDocument>(
  {
    word: { type: String, required: true },
    target_language: { type: String, required: true },
    native_language: { type: String, required: true },
    part_of_speech: { type: String, enum: PartOfSpeechEnum, default: null },
    senses: { type: [GlobalWordSensesSchema], default: [] },
    audio_url: { type: String, default: null },
    audio_url_request: { type: String, default: null },
    used_fallback: { type: Boolean, default: false },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
)

GlobalWordSchema.index({ word: 1, target_language: 1, native_language: 1 }, { unique: true })

export const GlobalWordModel = mongoose.model<IGlobalWordDocument>(MODEL_NAME, GlobalWordSchema)
