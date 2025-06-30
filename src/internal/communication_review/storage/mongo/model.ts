import mongoose, { Document, Schema } from "mongoose"

import {
  ICommunicationReview,
  ICommunicationReviewHistory,
  IConversationHistory,
  IErrorAnalysisEntity,
  IErrorImproveUserAnswer,
  IExpressionUsage,
  ILevelDiagnosis,
  IUserGoalEvaluation,
  IVocabularyUsage,
  IWord,
  IssueItem,
  VocabularyFrequencyLevelEnum,
} from "../../../../types"
import { MODEL_NAME as ORGANISATION_TABLE } from "../../../organisation/storage/mongo/model"
import { MODEL_NAME as SESSION_TABLE } from "../../../session/storage/mongo/model"
import { MODEL_NAME as USER_TABLE } from "../../../user/storage/mongo/model"

export const MODEL_NAME = "communication_reviews"

export type ICommunicationReviewDocument = ICommunicationReview & Document

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

const StatisticsHistorySchema = new Schema<ICommunicationReviewHistory>(
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
    topic_titles: { type: [String], required: true },
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

const InconsistentTurnSchema = new Schema(
  {
    question: { type: String, required: true },
    user_response: { type: String, required: true },
    comment: { type: String, required: true },
  },
  { _id: false },
)

const ConsistencyReviewSchema = new Schema(
  {
    consistency_score: { type: Number, required: true, min: 0, max: 100 },
    summary: { type: String, required: true },
    inconsistent_turns: { type: [InconsistentTurnSchema], required: true },
  },
  { _id: false },
)

const StatisticsSchema = new Schema<ICommunicationReviewDocument>(
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
    suggestion: { type: [String], required: true },
    conclusion: { type: String, required: true },
    user_cefr_level: { type: LevelDiagnosisSchema, required: true },
    goals_coverage: { type: [UserGoalEvaluationSchema], required: true },
    vocabulary_used: { type: [VocabularyUsageSchema], required: true },
    phrases_used: { type: [ExpressionUsageSchema], required: true },
    consistency_review: { type: ConsistencyReviewSchema, required: true },
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

export const StatisticsModel = mongoose.model<ICommunicationReviewDocument>(MODEL_NAME, StatisticsSchema)
