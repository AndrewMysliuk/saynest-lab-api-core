import mongoose, { Document, Schema } from "mongoose"

import { IPlanEntity, IPlanPaddlePriceIds, IPlanTrialInfo, PlanBillingPeriodEnum, PlanNameEnum, PlanStatusEnum } from "../../../../types"

export const MODEL_NAME = "plans"

export type IPlanDocument = IPlanEntity & Document

const PlanTrialInfoSchema = new Schema<IPlanTrialInfo>(
  {
    period_days: { type: Number, default: 0 },
    session_limit: { type: Number, default: 0 },
    review_limit: { type: Number, default: 0 },
    task_limit: { type: Number, default: 0 },
  },
  { _id: false },
)

const PaddlePriceIdsSchema = new Schema<IPlanPaddlePriceIds>(
  {
    trial: { type: String, required: true },
    no_trial: { type: String, required: true },
  },
  { _id: false },
)

const PlanSchema = new Schema<IPlanDocument>(
  {
    name: { type: String, enum: Object.values(PlanNameEnum), required: true },
    description: { type: String, required: true },
    features: { type: [String], required: true },
    paddle_price_ids: { type: PaddlePriceIdsSchema, required: true },
    currency: { type: String, required: true },
    amount: { type: Number, required: true },
    is_public: { type: Boolean, default: true },
    status: { type: String, enum: Object.values(PlanStatusEnum), required: true },
    billing_period: { type: String, enum: Object.values(PlanBillingPeriodEnum), required: true },
    trial_info: { type: PlanTrialInfoSchema, required: true },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
)

export const PlanModel = mongoose.model<IPlanDocument>(MODEL_NAME, PlanSchema)
