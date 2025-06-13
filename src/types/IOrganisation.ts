import { Types } from "mongoose"

export enum OrganizationStatusEnum {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  DELETED = "DELETED",
}

export interface IOrganizationSettings {
  locale?: string
  timezone?: string
}

export interface IOrganizationTrialUsage {
  session_count: number
  review_count: number
  task_count: number
}

export interface IOrganizationEntity {
  _id: Types.ObjectId
  owner_id: Types.ObjectId
  name: string
  subscription_id: Types.ObjectId | null
  status: OrganizationStatusEnum
  settings: IOrganizationSettings
  trial_usage: IOrganizationTrialUsage
  updated_at: Date
  created_at: Date
}

export interface IOrganizationUpdateRequest {
  name?: string
  status?: OrganizationStatusEnum
  settings?: Partial<IOrganizationSettings>
  owner_id?: string
  subscription_id?: Types.ObjectId
}
