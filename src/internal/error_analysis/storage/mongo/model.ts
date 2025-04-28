import mongoose, { Document, Schema } from "mongoose"

import { ErrorAnalysisSentenceStructureEnum, IErrorAnalysisEntity, IWord, IssueItem } from "../../../../types"
import { MODEL_NAME as ORGANISATION_TABLE } from "../../../organisation/storage/mongo/model"
import { MODEL_NAME as SESSION_TABLE } from "../../../session/storage/mongo/model"
import { MODEL_NAME as USER_TABLE } from "../../../user/storage/mongo/model"

export const MODEL_NAME = "error_analyses"

export type IErrorAnalysisDocument = IErrorAnalysisEntity & Document

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

const ErrorAnalysisSchema = new Schema<IErrorAnalysisDocument>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: USER_TABLE, required: false, default: null },
    organization_id: { type: Schema.Types.ObjectId, ref: ORGANISATION_TABLE, required: false, default: null },
    session_id: { type: Schema.Types.ObjectId, ref: SESSION_TABLE, required: true },
    improve_user_answer: { type: String, required: true },
    last_user_message: { type: String, required: true },
    suggestion_message: { type: String, required: true },
    detected_language: { type: String, required: true },
    is_target_language: { type: Boolean, required: true },
    prompt_id: { type: String, required: true },
    is_end: { type: Boolean, required: true },
    sentence_structure: {
      type: String,
      enum: Object.values(ErrorAnalysisSentenceStructureEnum),
      required: true,
    },
    issues: { type: [IssueSchema], required: true },
    has_errors: { type: Boolean, required: true },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
)

export const ErrorAnalysisModel = mongoose.model<IErrorAnalysisDocument>(MODEL_NAME, ErrorAnalysisSchema)
