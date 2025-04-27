import { IMongooseOptions, IRefreshTokenEntity } from "../../../types"

export interface IRepository {
  create(data: Partial<IRefreshTokenEntity>, options?: IMongooseOptions): Promise<IRefreshTokenEntity>
  getByToken(token: string, options?: IMongooseOptions): Promise<IRefreshTokenEntity | null>
  deleteByToken(token: string, options?: IMongooseOptions): Promise<void>
  deleteAllByUser(user_id: string, options?: IMongooseOptions): Promise<void>
  deleteAllExpired(current_date: Date, options?: IMongooseOptions): Promise<number>
}
