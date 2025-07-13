import mongoose, { Document, Schema } from "mongoose"

import { IUserProgressEntity, TaskTypeEnum, UserProgressTrendEnum, VocabularyFrequencyLevelEnum } from "../../../../types"
import { MODEL_NAME as ORGANISATION_TABLE } from "../../../organisation/storage/mongo/model"
import { MODEL_NAME as USER_TABLE } from "../../../user/storage/mongo/model"

export const MODEL_NAME = "user_progresses"

export type IUserProgressDocument = IUserProgressEntity & Document

const cefrHistorySchema = new Schema(
  {
    date: { type: Date, required: true },
    level: { type: String, enum: Object.values(VocabularyFrequencyLevelEnum), required: true },
  },
  { _id: false },
)

const ieltsHistorySchema = new Schema(
  {
    date: { type: Date, required: true },
    mark: { type: Number, min: 0, max: 9, required: true },
  },
  { _id: false },
)

const errorStatsSchema = new Schema(
  {
    category: { type: String, required: true },
    total_count: { type: Number, required: true },
    trend: { type: String, enum: Object.values(UserProgressTrendEnum), required: true },
  },
  { _id: false },
)

const tasksSchema = new Schema(
  {
    task_id: { type: String, required: true },
    type: { type: String, enum: Object.values(TaskTypeEnum), required: true },
    topic_title: { type: String, required: true },
    is_completed: { type: Boolean, default: false },
    created_at: { type: Date, required: true },
    completed_at: { type: Date, required: false },
  },
  { _id: false },
)

const userProgressSchema = new Schema<IUserProgressDocument>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: USER_TABLE, required: true },
    organization_id: { type: Schema.Types.ObjectId, ref: ORGANISATION_TABLE, required: false, default: null },
    total_sessions: { type: Number, required: true },
    avg_session_duration: { type: Number, required: true },
    total_session_duration: { type: Number, required: true },
    cefr_history: [cefrHistorySchema],
    ielts_marks_history: [ieltsHistorySchema],
    error_stats: [errorStatsSchema],
    completed_prompts: {
      type: Map,
      of: Number,
      default: {},
    },
    tasks: [tasksSchema],
    current_day_streak: { type: Number, required: true },
    longest_day_streak: { type: Number, required: true },
    activity_log: {
      type: Map,
      of: Boolean,
      default: {},
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
)

export const UserProgressModel = mongoose.model<IUserProgressDocument>(MODEL_NAME, userProgressSchema)
