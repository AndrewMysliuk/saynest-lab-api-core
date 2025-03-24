import mongoose, { Document, Schema } from "mongoose"

import { ISessionEntity, SessionStatusEnum, SessionTypeEnum } from "../../../../types"
import { MODEL_NAME as ORGANISATION_TABLE } from "../../../organisation/storage/mongo/model"
import { MODEL_NAME as USER_TABLE } from "../../../user/storage/mongo/model"

export const MODEL_NAME = "sessions"

export type ISessionDocument = ISessionEntity & Document

const sessionSchema = new Schema<ISessionDocument>({
  user_id: { type: Schema.Types.ObjectId, required: true, ref: USER_TABLE },
  organization_id: { type: Schema.Types.ObjectId, required: true, ref: ORGANISATION_TABLE },
  type: {
    type: String,
    enum: Object.values(SessionTypeEnum),
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(SessionStatusEnum),
    default: SessionStatusEnum.ACTIVE,
  },
  system_prompt: {
    type: String,
    default: "",
  },
  session_directory: {
    type: String,
    default: "",
  },
  created_at: {
    type: Date,
    default: () => new Date(),
  },
  ended_at: {
    type: Date,
    default: null,
  },
})

export const SessionModel = mongoose.model<ISessionEntity>(MODEL_NAME, sessionSchema)
