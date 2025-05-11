import { IMongooseOptions } from "../../types"
import { IUserProgressEntity } from "../../types"

export interface IUserProgressService {
  createIfNotExists(user_id: string, organization_id?: string, options?: IMongooseOptions): Promise<IUserProgressEntity | null>
  update(data: Partial<IUserProgressEntity>, user_id: string, options?: IMongooseOptions): Promise<IUserProgressEntity>
  getByUserId(user_id: string, options?: IMongooseOptions): Promise<IUserProgressEntity | null>
}
