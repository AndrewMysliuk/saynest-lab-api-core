import { ObjectId } from "mongoose"

export interface ISessionEntity {
  _id: ObjectId
  user_id: ObjectId
  organization_id: ObjectId
  type: "speaking" | "writing" | "reading" | "listening"
  title: string
  created_at: Date
  ended_at: Date
}
