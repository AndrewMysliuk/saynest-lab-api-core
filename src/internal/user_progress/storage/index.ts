import { Types } from "mongoose"

import { IMongooseOptions, IUserProgressEntity } from "../../../types"

export interface IRepository {
  createIfNotExists(user_id: Types.ObjectId, organization_id?: Types.ObjectId, options?: IMongooseOptions): Promise<IUserProgressEntity | null>
  update(data: Partial<IUserProgressEntity>, user_id: Types.ObjectId, options?: IMongooseOptions): Promise<IUserProgressEntity>
  getByUserId(user_id: Types.ObjectId, options?: IMongooseOptions): Promise<IUserProgressEntity | null>
}
