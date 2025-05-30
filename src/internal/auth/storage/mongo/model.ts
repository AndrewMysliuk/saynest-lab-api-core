import mongoose, { Document, Schema } from "mongoose"

import { IRefreshTokenEntity } from "../../../../types"
import { MODEL_NAME as ORGANISATION_TABLE } from "../../../organisation/storage/mongo/model"
import { MODEL_NAME as USER_TABLE } from "../../../user/storage/mongo/model"

export const MODEL_NAME = "refresh_tokens"

export type IRefreshTokenDocument = IRefreshTokenEntity & Document

const RefreshTokenSchema = new Schema<IRefreshTokenDocument>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: USER_TABLE, required: true },
    organization_id: { type: Schema.Types.ObjectId, ref: ORGANISATION_TABLE, required: true },
    token: { type: String, required: true, unique: true },
    ip: { type: String, required: false, default: null },
    user_agent: { type: String, required: false, default: null },
    created_at: { type: Date, required: true, default: Date.now },
    expires_at: { type: Date, required: true },
  },
  {
    timestamps: false,
  },
)

export const RefreshTokenModel = mongoose.model<IRefreshTokenDocument>(MODEL_NAME, RefreshTokenSchema)
