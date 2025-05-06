import mongoose, { Document, Schema } from "mongoose"

import {
  IConversationHistory,
  IErrorAnalysisEntity,
  IErrorImproveUserAnswer,
  IExpressionUsage,
  ILevelDiagnosis,
  IMeaningEntity,
  IStatistics,
  IStatisticsHistory,
  IUserGoalEvaluation,
  IVocabularyFillersEntity,
  IVocabularyUsage,
  IWord,
  IssueItem,
  PartOfSpeechEnum,
  VocabularyFrequencyLevelEnum,
} from "../../../../types"
import { MODEL_NAME as ORGANISATION_TABLE } from "../../../organisation/storage/mongo/model"
import { MODEL_NAME as SESSION_TABLE } from "../../../session/storage/mongo/model"
import { MODEL_NAME as USER_TABLE } from "../../../user/storage/mongo/model"

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

const VocabularySchema = new Schema<IVocabularyFillersEntity>(
  {
    target_language: { type: String, required: true },
    explanation_language: { type: String, required: true },
    word: { type: String, required: true },
    frequency_level: { type: String, enum: Object.values(VocabularyFrequencyLevelEnum), required: true },
    meanings: { type: [MeaningSchema], default: [] },
    repeated_count: { type: Number, required: true },
  },
  { _id: false },
)

const ConversationHistorySchema = new Schema<IConversationHistory>(
  {
    pair_id: { type: String, required: true },
    role: { type: String, enum: ["system", "user", "assistant"], required: true },
    content: { type: String, required: true },
    audio_url: { type: String, default: "" },
    audio_path: { type: String, default: "" },
    updated_at: { type: Date, required: true },
    created_at: { type: Date, required: true },
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
    id: { type: Number, required: true },
    value: { type: String, required: false, default: "" },
  },
  { _id: false },
)

const IssueSchema = new Schema<IssueItem>(
  {
    original_text: { type: String, required: true },
    corrected_text: { type: String, required: true },
    error_words: { type: [WordSchema], required: true },
    corrected_words: { type: [WordSchema], required: true },
    explanation: { type: String, required: true },
    topic_titles: { type: String, required: true },
  },
  { _id: false },
)

const ImproveAnswerSchema = new Schema<IErrorImproveUserAnswer>(
  {
    corrected_text: { type: String, required: true },
    cefr_level: { type: String, enum: Object.values(VocabularyFrequencyLevelEnum), required: true },
    explanation: { type: String, required: true },
  },
  { _id: false },
)

const ErrorAnalysisSchema = new Schema<IErrorAnalysisEntity>(
  {
    prompt_id: { type: String, required: true },
    issues: { type: [IssueSchema], required: true },
    has_errors: { type: Boolean, required: true },
    is_end: { type: Boolean, required: true },
    improve_user_answer: { type: ImproveAnswerSchema, required: true },
    detected_language: { type: String, required: true },
    is_target_language: { type: Boolean, required: true },
    last_user_message: { type: String, required: true },
  },
  { _id: false },
)

const LevelDiagnosisSchema = new Schema<ILevelDiagnosis>(
  {
    level: { type: String, enum: Object.values(VocabularyFrequencyLevelEnum), required: true },
    reasons: { type: String, required: true },
  },
  { _id: false },
)

const UserGoalEvaluationSchema = new Schema<IUserGoalEvaluation>({
  goal: { type: String, required: true },
  is_covered: { type: Boolean, required: true },
  quote_from_dialogue: { type: String, required: false },
})

const VocabularyUsageSchema = new Schema<IVocabularyUsage>({
  word: { type: String, required: true },
  is_used: { type: Boolean, required: true },
  quote_from_dialogue: { type: String, required: false },
})

const ExpressionUsageSchema = new Schema<IExpressionUsage>({
  phrase: { type: String, required: true },
  is_used: { type: Boolean, required: true },
  quote_from_dialogue: { type: String, required: false },
})

const StatisticsSchema = new Schema<IStatisticsDocument>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: USER_TABLE, required: true },
    organization_id: { type: Schema.Types.ObjectId, ref: ORGANISATION_TABLE, required: true },
    session_id: { type: Schema.Types.ObjectId, required: true, ref: SESSION_TABLE },
    prompt_id: { type: String, required: true },
    topic_title: { type: String, required: true },
    target_language: { type: String, required: true },
    explanation_language: { type: String, required: true },
    history: { type: StatisticsHistorySchema, required: true },
    error_analysis: { type: [ErrorAnalysisSchema], default: [] },
    vocabulary: { type: [VocabularySchema], default: [] },
    suggestion: { type: [String], required: true },
    conclusion: { type: String, required: true },
    user_cefr_level: { type: LevelDiagnosisSchema, required: true },
    goals_coverage: { type: [UserGoalEvaluationSchema], required: true },
    vocabulary_used: { type: [VocabularyUsageSchema], required: true },
    phrases_used: { type: [ExpressionUsageSchema], required: true },
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

StatisticsSchema.index({ session_id: 1 }, { unique: true })

export const StatisticsModel = mongoose.model<IStatisticsDocument>(MODEL_NAME, StatisticsSchema)
