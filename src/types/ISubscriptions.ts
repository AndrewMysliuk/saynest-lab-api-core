import { Types } from "mongoose"

export enum SubscriptionTypeEnum {
  ACTIVE = "ACTIVE",
  TRIALING = "TRIALING",
  CANCELLED = "CANCELLED",
  PAST_DUE = "PAST_DUE",
}

export interface ISubscriptionEntity {
  _id: Types.ObjectId
  organization_id: Types.ObjectId
  plan_id: Types.ObjectId
  paddle_subscription_id: string
  status: SubscriptionTypeEnum
  start_date: Date
  next_payment_date: Date
  canceled_at?: Date
  created_at: Date
  updated_at: Date
}
