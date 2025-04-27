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

export interface IOrganizationEntity {
  _id: Types.ObjectId
  owner_id: Types.ObjectId
  name: string
  plan_id: Types.ObjectId
  status: OrganizationStatusEnum
  settings: IOrganizationSettings
  updated_at: Date
  created_at: Date
}

export interface IOrganizationUpdateRequest {
  name?: string
  status?: OrganizationStatusEnum
  settings?: Partial<IOrganizationSettings>
  owner_id?: string
}
