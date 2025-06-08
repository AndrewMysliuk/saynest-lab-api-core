import { IMongooseOptions, ISubscriptionEntity } from "../../types"

export interface ISubscriptionService {
  create(data: Partial<ISubscriptionEntity>, options?: IMongooseOptions): Promise<ISubscriptionEntity>
  getByOrganizationId(organization_id: string, options?: IMongooseOptions): Promise<ISubscriptionEntity | null>
}
