import { IMongooseOptions, ISubscriptionEntity } from "../../../types"

export interface IRepository {
  create(data: Partial<ISubscriptionEntity>, options?: IMongooseOptions): Promise<ISubscriptionEntity>
  getById(id: string, options?: IMongooseOptions): Promise<ISubscriptionEntity | null>
  list(options?: IMongooseOptions): Promise<ISubscriptionEntity[]>
  update(id: string, dto: Partial<ISubscriptionEntity>, options?: IMongooseOptions): Promise<ISubscriptionEntity | null>
  setCancelledStatus(id: string, options?: IMongooseOptions): Promise<ISubscriptionEntity | null>
  getByOrganizationId(organization_id: string, options?: IMongooseOptions): Promise<ISubscriptionEntity | null>
}
