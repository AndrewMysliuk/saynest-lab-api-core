import { Types } from "mongoose"

import { IMongooseOptions, IUserProgressEntity } from "../../../types"

export interface IRepository {
  createIfNotExists(user_id: Types.ObjectId, organization_id?: Types.ObjectId, options?: IMongooseOptions): Promise<IUserProgressEntity | null>
  update(data: Partial<IUserProgressEntity>, user_id: Types.ObjectId, options?: IMongooseOptions): Promise<IUserProgressEntity>
  addActivityDate(
    user_id: Types.ObjectId,
    date: string,
    streakData?: {
      current_day_streak: number
      longest_day_streak?: number
    },
    options?: IMongooseOptions,
  ): Promise<void>
  getByUserId(user_id: Types.ObjectId, options?: IMongooseOptions): Promise<IUserProgressEntity | null>
}
