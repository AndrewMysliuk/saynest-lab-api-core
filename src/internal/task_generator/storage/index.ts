import { Types } from "mongoose"

import { IGenericTaskEntity, IMongooseOptions } from "../../../types"

export interface IRepository {
  create(task: Partial<IGenericTaskEntity>, options?: IMongooseOptions): Promise<IGenericTaskEntity>
  setCompleted(task_id: Types.ObjectId, answers: Record<number, string>, options?: IMongooseOptions): Promise<IGenericTaskEntity | null>
  listByReviewId(user_id: Types.ObjectId, review_id: Types.ObjectId, options?: IMongooseOptions): Promise<IGenericTaskEntity[]>
  getById(task_id: Types.ObjectId, options?: IMongooseOptions): Promise<IGenericTaskEntity | null>
}
