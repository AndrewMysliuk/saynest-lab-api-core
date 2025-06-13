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

export interface IPlanTrialInfo {
  period_days: number
  session_limit: number
  review_limit: number
  task_limit: number
}

export interface IPlanPaddlePriceIds {
  trial: string
  no_trial: string
}

export interface IPlanEntity {
  _id: Types.ObjectId
  name: PlanNameEnum
  description: string
  features: string[]
  paddle_price_ids: IPlanPaddlePriceIds
  currency: string
  amount: number
  is_public: boolean
  status: PlanStatusEnum
  billing_period: PlanBillingPeriodEnum
  trial_info: IPlanTrialInfo
  created_at: Date
  updated_at: Date
}
