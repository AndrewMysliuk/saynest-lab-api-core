import { ObjectId } from "mongoose"

export enum UserRoleEnum {
  USER = "USER",
  ADMIN = "ADMIN",
  OWNER = "OWNER",
}

export interface IUserEntity {
  _id: ObjectId
  organization_id: ObjectId
  email: string
  first_name: string
  last_name: string
  country: string
  role: UserRoleEnum
  updated_at: Date
  created_at: Date
}
