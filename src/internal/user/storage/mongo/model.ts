import mongoose, { Document, Schema, Types } from "mongoose"

import { IUserEntity, UserRoleEnum } from "../../../../types"
import { MODEL_NAME as ORGANISATION_TABLE } from "../../../organisation/storage/mongo/model"

export const MODEL_NAME = "users"

export type IUserDocument = IUserEntity & Document

const UserSchema = new Schema<IUserEntity>(
  {
    organization_id: { type: Types.ObjectId, ref: ORGANISATION_TABLE, required: true },
    email: { type: String, required: true, unique: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    country: { type: String, required: true },
    role: { type: String, enum: UserRoleEnum, default: UserRoleEnum.USER },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
)

export const UserModel = mongoose.model<IUserEntity>(MODEL_NAME, UserSchema)
