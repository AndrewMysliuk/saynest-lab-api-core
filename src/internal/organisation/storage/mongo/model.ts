import mongoose, { Document, Schema } from "mongoose"

import { IOrganizationEntity, IOrganizationSettings, OrganizationStatusEnum } from "../../../../types"

export const MODEL_NAME = "organizations"

export type IOrganizationDocument = IOrganizationEntity & Document

const OrganizationSettingsSchema = new Schema<IOrganizationSettings>(
  {
    locale: { type: String, required: false },
    timezone: { type: String, required: false },
  },
  { _id: false },
)

const OrganizationSchema = new Schema<IOrganizationDocument>(
  {
    owner_id: { type: Schema.Types.ObjectId, required: false, default: null },
    name: { type: String, required: true },
    subscription_id: { type: Schema.Types.ObjectId, required: false, default: null },
    status: { type: String, enum: Object.values(OrganizationStatusEnum), default: OrganizationStatusEnum.ACTIVE, required: true },
    settings: { type: OrganizationSettingsSchema, required: false },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
)

export const OrganizationModel = mongoose.model<IOrganizationDocument>(MODEL_NAME, OrganizationSchema)
