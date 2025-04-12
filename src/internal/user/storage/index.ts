import { IMongooseOptions, IUserEntity, UserRoleEnum } from "../../../types"

export interface IRepository {
  create(data: Partial<IUserEntity>, options?: IMongooseOptions): Promise<IUserEntity>
  getById(id: string, options?: IMongooseOptions): Promise<IUserEntity | null>
  getByEmail(email: string, options?: IMongooseOptions): Promise<IUserEntity | null>
  listByOrganization(org_id: string, options?: IMongooseOptions): Promise<IUserEntity[]>
  listAll(options?: IMongooseOptions): Promise<IUserEntity[]>
  updateRole(user_id: string, role: UserRoleEnum, options?: IMongooseOptions): Promise<IUserEntity>
}
