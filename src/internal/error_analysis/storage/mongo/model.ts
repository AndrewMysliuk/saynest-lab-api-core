import mongoose, { Document, Schema } from "mongoose"

import { IErrorAnalysisEntity, IWord, IssueItem } from "../../../../types"

export const MODEL_NAME = "error_analyses"

export type IErrorAnalysisDocument = IErrorAnalysisEntity & Document

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

const ErrorAnalysisSchema = new Schema<IErrorAnalysisDocument>(
  {
    session_id: { type: String, required: true },
    message: { type: String, required: true },
    issues: { type: [IssueSchema], default: [] },
    summary_comment: String,
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
