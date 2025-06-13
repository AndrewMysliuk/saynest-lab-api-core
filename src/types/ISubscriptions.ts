import { Types } from "mongoose"

export enum SubscriptionTypeEnum {
  ACTIVE = "ACTIVE",
  TRIALING = "TRIALING",
  CANCELLED = "CANCELLED",
  PAST_DUE = "PAST_DUE",
}

export interface ISubscriptionTrialDates {
  starts_at: Date
  ends_at: Date
}

export interface ISubscriptionEntity {
  _id: Types.ObjectId
  organization_id: Types.ObjectId
  plan_id: Types.ObjectId
  paddle_subscription_id: string
  status: SubscriptionTypeEnum
  trial_dates: ISubscriptionTrialDates | null
  start_date: Date
  next_payment_date: Date | null
  scheduled_cancel_at?: Date | null
  is_pending_cancel: boolean
  canceled_at?: Date | null
  created_at: Date
  updated_at: Date
}

export interface ISubscriptionChangePlanRequest {
  organization_id: string
  plan_id: string
}

export const normalizeStatus = (status: string): SubscriptionTypeEnum | null => {
  switch (status) {
    case "active":
      return SubscriptionTypeEnum.ACTIVE
    case "trialing":
      return SubscriptionTypeEnum.TRIALING
    case "canceled":
      return SubscriptionTypeEnum.CANCELLED
    case "past_due":
      return SubscriptionTypeEnum.PAST_DUE
    default:
      return null
  }
}
