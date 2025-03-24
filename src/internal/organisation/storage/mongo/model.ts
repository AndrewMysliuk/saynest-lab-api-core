import mongoose, { Document, Schema, Types } from "mongoose"

import { IOrganizationEntity } from "../../../../types"

export const MODEL_NAME = "organisations"

export type IOrganisationDocument = IOrganizationEntity & Document

const OrganizationSchema = new Schema<IOrganizationEntity>({
  owner_id: { type: Types.ObjectId, required: true },
  name: { type: String, required: true },
  created_at: { type: Date, default: () => new Date() },
})

export const OrganizationModel = mongoose.model<IOrganizationEntity>(MODEL_NAME, OrganizationSchema)
