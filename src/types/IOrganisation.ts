import { ObjectId } from "mongoose"

export interface IOrganizationEntity {
  _id: ObjectId
  owner_id: ObjectId
  name: string
  updated_at: Date
  created_at: Date
}
