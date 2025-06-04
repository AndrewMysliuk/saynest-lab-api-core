import mongoose, { Document, Schema } from "mongoose"

import { IUserEntity, IUserSettings, UserRoleEnum, UserStatusEnum } from "../../../../types"
import { MODEL_NAME as ORGANISATION_TABLE } from "../../../organisation/storage/mongo/model"

export const MODEL_NAME = "users"

export type IUserDocument = IUserEntity & Document

const UserSettingsSchema = new Schema<IUserSettings>(
  {
    phone: { type: String, required: false },
    avatar_url: { type: String, required: false },
    is_accept_terms_and_conditions: { type: Boolean, default: false },
    is_accept_privacy_policy: { type: Boolean, default: false },
    is_accept_refund_policy: { type: Boolean, default: false },
  },
  { _id: false },
)

const UserSchema = new Schema<IUserDocument>(
  {
    organization_id: { type: Schema.Types.ObjectId, ref: ORGANISATION_TABLE, required: true },
    is_email_confirmed: { type: Boolean, default: false },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    country: { type: String, required: true },
    explanation_language: { type: String, default: null },
    role: { type: String, enum: Object.values(UserRoleEnum), default: UserRoleEnum.USER, required: true },
    status: { type: String, enum: Object.values(UserStatusEnum), default: UserStatusEnum.ACTIVE, required: true },
    settings: { type: UserSettingsSchema, required: true },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
)

export const UserModel = mongoose.model<IUserDocument>(MODEL_NAME, UserSchema)
