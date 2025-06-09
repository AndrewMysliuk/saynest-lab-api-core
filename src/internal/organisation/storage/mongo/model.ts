import mongoose, { Document, Schema } from "mongoose"

import { IOrganizationEntity, IOrganizationSettings, IOrganizationTrialUsage, OrganizationStatusEnum } from "../../../../types"

export const MODEL_NAME = "organizations"

export type IOrganizationDocument = IOrganizationEntity & Document

const OrganizationSettingsSchema = new Schema<IOrganizationSettings>(
  {
    locale: { type: String, default: "" },
    timezone: { type: String, default: "" },
  },
  { _id: false },
)

const OrganizationTrialUsageSchema = new Schema<IOrganizationTrialUsage>(
  {
    session_count: { type: Number, default: 0 },
    review_count: { type: Number, default: 0 },
    task_count: { type: Number, default: 0 },
  },
  { _id: false },
)

const OrganizationSchema = new Schema<IOrganizationDocument>(
  {
    owner_id: { type: Schema.Types.ObjectId, required: false, default: null },
    name: { type: String, required: true },
    subscription_id: { type: Schema.Types.ObjectId, required: false, default: null },
    status: { type: String, enum: Object.values(OrganizationStatusEnum), default: OrganizationStatusEnum.ACTIVE, required: true },
    settings: { type: OrganizationSettingsSchema, default: () => ({}) },
    trial_usage: { type: OrganizationTrialUsageSchema, default: () => ({}) },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
)

export const OrganizationModel = mongoose.model<IOrganizationDocument>(MODEL_NAME, OrganizationSchema)
