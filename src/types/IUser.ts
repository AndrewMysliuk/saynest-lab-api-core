import { ObjectId } from "mongoose"

export interface IUserEntity {
  _id: ObjectId
  email: string
  first_name: string
  last_name: string
  country: string
  organization_id: ObjectId
  role: "user" | "admin" | "owner"
  created_at: Date
}
