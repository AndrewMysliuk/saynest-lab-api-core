import { IMongooseOptions, IUserCreateRequest, IUserEntity } from "../../types"

export interface IUserService {
  create(dto: IUserCreateRequest, options?: IMongooseOptions): Promise<IUserEntity>
  getByEmail(email: string, options?: IMongooseOptions): Promise<IUserEntity | null>
  getById(id: string, options?: IMongooseOptions): Promise<IUserEntity | null>
}
