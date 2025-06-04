import { IMongooseOptions, IUserCreateRequest, IUserEntity, IUserUpdateRequest } from "../../types"

export interface IUserService {
  create(dto: IUserCreateRequest, options?: IMongooseOptions): Promise<IUserEntity>
  getByEmail(email: string, options?: IMongooseOptions): Promise<IUserEntity | null>
  getById(id: string, options?: IMongooseOptions): Promise<IUserEntity | null>
  update(id: string, dto: IUserUpdateRequest, options?: IMongooseOptions): Promise<IUserEntity | null>
  acceptUserPolicies(userId: string, options?: IMongooseOptions): Promise<IUserEntity | null>
}
