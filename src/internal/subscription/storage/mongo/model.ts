import mongoose, { Document, Schema } from "mongoose"

import { ISubscriptionEntity, SubscriptionTypeEnum } from "../../../../types"
import { MODEL_NAME as ORGANISATION_TABLE } from "../../../organisation/storage/mongo/model"
import { MODEL_NAME as PLAN_TABLE } from "../../../plans/storage/mongo/model"

export const MODEL_NAME = "subscriptions"

export type ISubscriptionDocument = ISubscriptionEntity & Document

const SubscriptionSchema = new Schema<ISubscriptionDocument>(
  {
    organization_id: { type: Schema.Types.ObjectId, required: true, ref: ORGANISATION_TABLE },
    plan_id: { type: Schema.Types.ObjectId, required: true, ref: PLAN_TABLE },
    paddle_subscription_id: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(SubscriptionTypeEnum),
      required: true,
      default: SubscriptionTypeEnum.ACTIVE,
    },
    start_date: { type: Date, required: true },
    next_payment_date: { type: Date, required: true },
    canceled_at: { type: Date, required: false },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
)

export const SubscriptionModel = mongoose.model<ISubscriptionDocument>(MODEL_NAME, SubscriptionSchema)
