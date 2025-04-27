import { IMongooseOptions, IOrganizationEntity, IOrganizationUpdateRequest,  } from "../../../types"

export interface IRepository {
  create(data: Partial<IOrganizationEntity>, options?: IMongooseOptions): Promise<IOrganizationEntity>
  getById(id: string, options?: IMongooseOptions): Promise<IOrganizationEntity | null>
  getByOwnerId(owner_id: string, options?: IMongooseOptions): Promise<IOrganizationEntity | null>
  list(options?: IMongooseOptions): Promise<IOrganizationEntity[]>
  update(id: string, dto: IOrganizationUpdateRequest, options?: IMongooseOptions): Promise<IOrganizationEntity | null>
}
