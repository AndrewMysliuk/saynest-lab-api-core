import mongoose, { Document, Schema } from "mongoose"

import { ISessionEntity, SessionStatusEnum, SessionTypeEnum } from "../../../../types"

export const TABLE_NAME = "sessions"

export type ISessionDocument = ISessionEntity & Document

const sessionSchema = new Schema<ISessionDocument>({
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

export const SessionModel = mongoose.model<ISessionEntity>(TABLE_NAME, sessionSchema)
