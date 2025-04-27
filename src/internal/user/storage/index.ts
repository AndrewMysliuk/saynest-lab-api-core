import { IMongooseOptions, IUserEntity, IUserUpdateRequest } from "../../../types"

export interface IRepository {
  create(data: Partial<IUserEntity>, options?: IMongooseOptions): Promise<IUserEntity>
  getById(id: string, options?: IMongooseOptions): Promise<IUserEntity | null>
  getByEmail(email: string, options?: IMongooseOptions): Promise<IUserEntity | null>
  listByOrganization(organization_id: string, options?: IMongooseOptions): Promise<IUserEntity[]>
  listAll(options?: IMongooseOptions): Promise<IUserEntity[]>
  update(id: string, dto: IUserUpdateRequest, options?: IMongooseOptions): Promise<IUserEntity | null>
}
