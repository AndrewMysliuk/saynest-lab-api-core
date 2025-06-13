import { IMongooseOptions, ISubscriptionEntity, SubscriptionTypeEnum } from "../../../types"

export interface IRepository {
  create(data: Partial<ISubscriptionEntity>, options?: IMongooseOptions): Promise<ISubscriptionEntity>
  getById(id: string, options?: IMongooseOptions): Promise<ISubscriptionEntity | null>
  getByPaddleSubscriptionId(paddle_subscription_id: string, options?: IMongooseOptions): Promise<ISubscriptionEntity | null>
  list(options?: IMongooseOptions): Promise<ISubscriptionEntity[]>
  update(id: string, dto: Partial<ISubscriptionEntity>, options?: IMongooseOptions): Promise<ISubscriptionEntity | null>
  setStatus(id: string, status: SubscriptionTypeEnum, options?: IMongooseOptions): Promise<ISubscriptionEntity | null>
  getByOrganizationId(organization_id: string, options?: IMongooseOptions): Promise<ISubscriptionEntity | null>
}
