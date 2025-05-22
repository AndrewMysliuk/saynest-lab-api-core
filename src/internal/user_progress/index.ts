import { IGenericTaskEntity, IMongooseOptions, IUserProgressApplyReviewStatsRequest } from "../../types"
import { IUserProgressEntity } from "../../types"

export interface IUserProgressService {
  createIfNotExists(user_id: string, organization_id?: string, options?: IMongooseOptions): Promise<IUserProgressEntity | null>
  update(data: Partial<IUserProgressEntity>, user_id: string, options?: IMongooseOptions): Promise<IUserProgressEntity>
  getByUserId(user_id: string, options?: IMongooseOptions): Promise<IUserProgressEntity | null>
  markUserActivity(user_id: string, options?: IMongooseOptions): Promise<void>
  syncTaskProgress(user_id: string, taskEntity: IGenericTaskEntity, options?: IMongooseOptions): Promise<void>
  applyReviewStats(dto: IUserProgressApplyReviewStatsRequest, options?: IMongooseOptions): Promise<void>
}
