import { ObjectId } from "mongoose"

export enum SessionTypeEnum {
  SPEACKING = "SPEACKING",
  WRITING = "WRITING",
  READING = "READING",
  LISETNING = "LISETNING",
}

export enum SessionStatusEnum {
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
  DELETED = "DELETED",
}

export interface ISessionEntity {
  _id: ObjectId
  prompt_id: string
  // user_id: ObjectId
  // organization_id: ObjectId
  type: SessionTypeEnum
  status: SessionStatusEnum
  system_prompt: string
  session_directory: string
  updated_at: Date
  created_at: Date
  ended_at: Date
}

export interface ISessionCreateRequest {
  type: SessionTypeEnum
  system_prompt: string
  prompt_id: string
}
