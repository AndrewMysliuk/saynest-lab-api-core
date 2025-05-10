import { Types } from "mongoose"

export enum UserRoleEnum {
  USER = "USER",
  ADMIN = "ADMIN",
  OWNER = "OWNER",
}

export enum UserStatusEnum {
  ACTIVE = "ACTIVE",
  INVITED = "INVITED",
  DEACTIVATED = "DEACTIVATED",
  DELETED = "DELETED",
}

export interface IUserSettings {
  phone?: string
  avatar_url?: string
}

export interface IUserEntity {
  _id: Types.ObjectId
  organization_id: Types.ObjectId
  email: string
  password: string
  is_email_confirmed: boolean
  first_name: string
  last_name: string
  country: string
  explanation_language: string | null
  role: UserRoleEnum
  status: UserStatusEnum
  settings?: IUserSettings
  updated_at: Date
  created_at: Date
}

export interface IUserUpdateRequest {
  first_name?: string
  last_name?: string
  email?: string
  explanation_language?: string
  country?: string
  role?: UserRoleEnum
  status?: UserStatusEnum
  settings?: Partial<IUserSettings>
}

export interface IUserCreateRequest {
  email: string
  password: string
  first_name: string
  last_name: string
  country: string
  is_email_confirmed?: boolean
  explanation_language: string | null
  role: UserRoleEnum
  organization_id: string
}

export interface IUserJWTPayload {
  user_id: string
  organization_id: string
}
