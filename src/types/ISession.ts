import { Types } from "mongoose"

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

export enum SessionIeltsPartEnum {
  PART_1 = 1,
  PART_2 = 2,
  PART_3 = 3,
}

export interface ISessionEntity {
  _id: Types.ObjectId
  user_id: Types.ObjectId | null
  organization_id: Types.ObjectId | null
  prompt_id: string
  active_ielts_part?: SessionIeltsPartEnum
  type: SessionTypeEnum
  status: SessionStatusEnum
  system_prompt: string
  session_directory: string
  updated_at: Date
  created_at: Date
  ended_at: Date
}

export interface ISessionCreateRequest {
  prompt_id: string
  active_ielts_part?: SessionIeltsPartEnum
  user_id: string | null
  organization_id: string | null
  system_prompt?: string
  session_directory: string
  type: SessionTypeEnum
}

export interface ISessionIds {
  _id: string
  user_id: string | undefined
  organization_id: string | undefined
}
