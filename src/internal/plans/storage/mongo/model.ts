import mongoose, { Document, Schema } from "mongoose"

import { IPlanEntity, PlanBillingPeriodEnum, PlanNameEnum, PlanStatusEnum } from "../../../../types"

export const MODEL_NAME = "plans"

export type IPlanDocument = IPlanEntity & Document

const PlanSchema = new Schema<IPlanDocument>(
  {
    name: { type: String, enum: Object.values(PlanNameEnum), required: true },
    description: { type: String, required: true },
    paddle_price_id: { type: String, required: true },
    currency: { type: String, required: true },
    amount: { type: Number, required: true },
    is_public: { type: Boolean, default: true },
    status: { type: String, enum: Object.values(PlanStatusEnum), required: true },
    billing_period: { type: String, enum: Object.values(PlanBillingPeriodEnum), required: true },
    trial_period_days: { type: Number, default: 0 },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
)

export const PlanModel = mongoose.model<IPlanDocument>(MODEL_NAME, PlanSchema)
