import mongoose, { Document, Schema } from "mongoose"

import { IGenericTaskEntity, TaskModeEnum, TaskTypeEnum } from "../../../../types"
import { MODEL_NAME as REVIEW_TABLE } from "../../../communication_review/storage/mongo/model"
import { MODEL_NAME as ORGANISATION_TABLE } from "../../../organisation/storage/mongo/model"
import { MODEL_NAME as USER_TABLE } from "../../../user/storage/mongo/model"

export const MODEL_NAME = "tasks"

export type ITaskDocument = IGenericTaskEntity & Document

const taskSchema = new Schema<ITaskDocument>(
  {
    type: { type: String, enum: Object.values(TaskTypeEnum), required: true },
    mode: { type: String, enum: Object.values(TaskModeEnum), required: true },
    topic_title: { type: String, required: true },
    target_language: { type: String, required: true },
    explanation_language: { type: String, required: true },
    task: { type: Schema.Types.Mixed, required: true },
    is_completed: { type: Boolean, default: false },
    user_id: { type: Schema.Types.ObjectId, ref: USER_TABLE, required: true },
    organization_id: { type: Schema.Types.ObjectId, ref: ORGANISATION_TABLE, required: false, default: null },
    review_id: { type: Schema.Types.ObjectId, ref: REVIEW_TABLE, required: true },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
)

export const TaskModel = mongoose.model<ITaskDocument>(MODEL_NAME, taskSchema)
