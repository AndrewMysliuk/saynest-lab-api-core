import mongoose, { Document, Schema, Types } from "mongoose"

import { IRefreshTokenEntity } from "../../../../types"

export const MODEL_NAME = "refresh_tokens"

export type IRefreshTokenDocument = IRefreshTokenEntity & Document

const RefreshTokenSchema = new Schema<IRefreshTokenDocument>(
  {
    user_id: { type: Schema.Types.ObjectId, required: true, index: true },
    organization_id: { type: Schema.Types.ObjectId, required: true },
    token: { type: String, required: true, unique: true },
    ip: { type: String, required: true },
    user_agent: { type: String, required: true },
    created_at: { type: Date, required: true, default: Date.now },
    expires_at: { type: Date, required: true },
  },
  {
    timestamps: false,
  },
)

export const RefreshTokenModel = mongoose.model<IRefreshTokenDocument>(MODEL_NAME, RefreshTokenSchema)
