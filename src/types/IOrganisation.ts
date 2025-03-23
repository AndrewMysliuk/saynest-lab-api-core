import { ObjectId } from "mongoose"

export interface IOrganizationEntity {
  _id: ObjectId
  owner_id: ObjectId
  name: string
  created_at: Date
}
