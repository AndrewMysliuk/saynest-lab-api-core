import mongoose, { Document, Schema, Types } from "mongoose"

import { IOrganizationEntity } from "../../../../types"

export const MODEL_NAME = "organisations"

export type IOrganisationDocument = IOrganizationEntity & Document

const OrganizationSchema = new Schema<IOrganizationEntity>(
  {
    owner_id: { type: Types.ObjectId, required: true },
    name: { type: String, required: true },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
)

export const OrganizationModel = mongoose.model<IOrganizationEntity>(MODEL_NAME, OrganizationSchema)
