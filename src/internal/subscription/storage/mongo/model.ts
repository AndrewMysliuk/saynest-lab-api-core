import mongoose, { Document, Schema } from "mongoose"

import { ISubscriptionEntity, ISubscriptionTrialDates, SubscriptionTypeEnum } from "../../../../types"
import { MODEL_NAME as ORGANISATION_TABLE } from "../../../organisation/storage/mongo/model"
import { MODEL_NAME as PLAN_TABLE } from "../../../plans/storage/mongo/model"

export const MODEL_NAME = "subscriptions"

export type ISubscriptionDocument = ISubscriptionEntity & Document

export const TrialDatesSchema = new Schema<ISubscriptionTrialDates>(
  {
    starts_at: { type: Date, required: false },
    ends_at: { type: Date, required: false },
  },
  { _id: false },
)

const SubscriptionSchema = new Schema<ISubscriptionDocument>(
  {
    organization_id: { type: Schema.Types.ObjectId, required: true, ref: ORGANISATION_TABLE, unique: true, index: true },
    plan_id: { type: Schema.Types.ObjectId, required: true, ref: PLAN_TABLE },
    paddle_subscription_id: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(SubscriptionTypeEnum),
      required: true,
      default: SubscriptionTypeEnum.ACTIVE,
    },
    trial_dates: { type: TrialDatesSchema, required: false, default: null },
    start_date: { type: Date, required: true },
    next_payment_date: { type: Date, required: true, default: null },
    canceled_at: { type: Date, required: false, default: null },
    scheduled_cancel_at: { type: Date, required: false, default: null },
    is_pending_cancel: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
)

SubscriptionSchema.index(
  { organization_id: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: [SubscriptionTypeEnum.ACTIVE, SubscriptionTypeEnum.TRIALING] },
    },
    name: "unique_active_subscription_per_org",
  },
)

export const SubscriptionModel = mongoose.model<ISubscriptionDocument>(MODEL_NAME, SubscriptionSchema)
