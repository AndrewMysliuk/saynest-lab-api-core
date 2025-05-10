import { IMongooseOptions, IOrganizationEntity, IOrganizationUpdateRequest } from "../../types"

export interface IOrganisationService {
  create(name: string, options?: IMongooseOptions): Promise<IOrganizationEntity>
  setOwner(id: string, owner_id: string, options?: IMongooseOptions): Promise<IOrganizationEntity>
  update(id: string, dto: IOrganizationUpdateRequest, options?: IMongooseOptions): Promise<IOrganizationEntity | null>
}
