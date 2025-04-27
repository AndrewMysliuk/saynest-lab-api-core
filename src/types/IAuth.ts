import { Types } from "mongoose"

import { IUserEntity } from "./IUser"

export interface IRefreshTokenEntity {
  _id: Types.ObjectId
  user_id: Types.ObjectId
  organization_id: Types.ObjectId
  token: string
  ip: string
  user_agent: string
  created_at: Date
  expires_at: Date
}

export interface IRegisterRequest {
  email: string
  password: string
  first_name: string
  last_name: string
  country: string
  organization_name?: string
}

export interface IRegisterResponse {
  access_token: string
  refresh_token: string
  user: IUserEntity
}

export interface ILoginRequest {
  email: string
  password: string
}

export interface ILoginResponse {
  access_token: string
  refresh_token: string
  user: IUserEntity
}
