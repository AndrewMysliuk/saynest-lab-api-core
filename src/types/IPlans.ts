import { Types } from "mongoose"

export enum PlanNameEnum {
  STANDARD = "STANDARD",
  TEST = "TEST",
}

export enum PlanBillingPeriodEnum {
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

export enum PlanStatusEnum {
  ACTIVE = "ACTIVE",
  DIACTIVATED = "DIACTIVATED",
}

export interface IPlanEntity {
  _id: Types.ObjectId
  name: PlanNameEnum
  description: string
  paddle_price_id: string
  currency: string
  amount: number
  is_public: boolean
  status: PlanStatusEnum
  billing_period: PlanBillingPeriodEnum
  trial_period_days: number
  created_at: Date
  updated_at: Date
}
