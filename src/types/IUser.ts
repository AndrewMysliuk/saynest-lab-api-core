import { ObjectId } from "mongoose"

export interface IUserEntity {
  _id: ObjectId
  organization_id: ObjectId
  email: string
  first_name: string
  last_name: string
  country: string
  role: "user" | "admin" | "owner"
  created_at: Date
}
