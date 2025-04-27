import { IMongooseOptions, IOrganizationEntity } from "../../types"

export interface IOrganisationService {
  create(name: string, options?: IMongooseOptions): Promise<IOrganizationEntity>
  setOwner(id: string, owner_id: string, options?: IMongooseOptions): Promise<IOrganizationEntity>
}
