import { IOrganizationEntity } from "../../../types"

export interface IRepository {
  create(data: Partial<IOrganizationEntity>): Promise<IOrganizationEntity>
  getById(id: string): Promise<IOrganizationEntity | null>
  getByOwnerId(owner_id: string): Promise<IOrganizationEntity | null>
  list(): Promise<IOrganizationEntity[]>
}
