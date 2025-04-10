import mongoose, { Document, Schema } from "mongoose"

import {
  IConversationHistory,
  IErrorAnalysisEntity,
  IMeaningEntity,
  IStatistics,
  IStatisticsHistory,
  IVocabularyEntity,
  IWord,
  IssueItem,
  PartOfSpeechEnum,
  VocabularyFrequencyLevelEnum,
} from "../../../../types"
import { MODEL_NAME as SESSION_TABLE } from "../../../session/storage/mongo/model"

export const MODEL_NAME = "statistics"

export type IStatisticsDocument = IStatistics & Document

const MeaningSchema = new Schema<IMeaningEntity>(
  {
    part_of_speech: { type: String, enum: Object.values(PartOfSpeechEnum), required: true },
    translation: { type: String, required: true },
    meaning: { type: String, required: true },
    synonyms: [{ type: String }],
  },
  { _id: false },
)

const VocabularySchema = new Schema<IVocabularyEntity>(
  {
    language: { type: String, required: true },
    translation_language: { type: String, required: true },
    word: { type: String, required: true },
    frequency_level: { type: String, enum: Object.values(VocabularyFrequencyLevelEnum), required: true },
    meanings: { type: [MeaningSchema], default: [] },
    audio_base64: { type: String, default: null },
  },
  { _id: false },
)

const ConversationHistorySchema = new Schema<IConversationHistory>(
  {
    pair_id: { type: String, required: true },
    role: { type: String, enum: ["system", "user", "assistant"], required: true },
    content: { type: String, required: true },
    audio_url: String,
  },
  { _id: false },
)

const StatisticsHistorySchema = new Schema<IStatisticsHistory>(
  {
    start_time: { type: Date, required: true },
    duration_seconds: { type: Number, required: true },
    user_utterances_count: { type: Number, required: true },
    model_utterances_count: { type: Number, required: true },
    messages: { type: [ConversationHistorySchema], default: [] },
  },
  { _id: false },
)

const WordSchema = new Schema<IWord>(
  {
    id: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false },
)

const IssueSchema = new Schema<IssueItem>(
  {
    original_text: String,
    corrected_text: String,
    error_words: [WordSchema],
    corrected_words: [WordSchema],
    explanation: String,
    topic_tag: String,
  },
  { _id: false },
)

const ErrorAnalysisSchema = new Schema<IErrorAnalysisEntity>(
  {
    message: { type: String, required: true },
    issues: { type: [IssueSchema], default: [] },
    summary_comment: String,
    has_errors: { type: Boolean, required: true },
  },
  { _id: false },
)

const StatisticsSchema = new Schema<IStatisticsDocument>(
  {
    session_id: { type: String, required: true, ref: SESSION_TABLE },
    topic_title: { type: String, required: true },
    language: { type: String, required: true },
    user_language: { type: String, required: true },
    history: { type: StatisticsHistorySchema, required: true },
    error_analysis: { type: [ErrorAnalysisSchema], default: [] },
    vocabulary: { type: [VocabularySchema], default: [] },
    suggestion: { type: String, required: true },
    conclusion: { type: String, required: true },
    user_cefr_level: { type: String, enum: Object.values(VocabularyFrequencyLevelEnum), required: true },
    updated_at: { type: Date, default: Date.now },
    created_at: { type: Date, default: Date.now },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
)

export const StatisticsModel = mongoose.model<IStatisticsDocument>(MODEL_NAME, StatisticsSchema)
