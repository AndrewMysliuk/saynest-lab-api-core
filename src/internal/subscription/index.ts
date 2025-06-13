import { IMongooseOptions, ISubscriptionChangePlanRequest, ISubscriptionEntity } from "../../types"

export interface ISubscriptionService {
  create(data: Partial<ISubscriptionEntity>, options?: IMongooseOptions): Promise<ISubscriptionEntity>
  getByOrganizationId(organization_id: string, options?: IMongooseOptions): Promise<ISubscriptionEntity | null>
  createSubscription(paddle_subscription_id: string, options?: IMongooseOptions): Promise<ISubscriptionEntity | null>
  cancelSubscription(organization_id: string, options?: IMongooseOptions): Promise<ISubscriptionEntity | null>
  recancelSubscription(organization_id: string, options?: IMongooseOptions): Promise<ISubscriptionEntity | null>
  activateFromTrialSubscription(organization_id: string, options?: IMongooseOptions): Promise<ISubscriptionEntity | null>
  cancelledSubscription(paddle_subscription_id: string, options?: IMongooseOptions): Promise<ISubscriptionEntity | null>
  pastDueSubscription(paddle_subscription_id: string, options?: IMongooseOptions): Promise<ISubscriptionEntity | null>
  getPaymentDetailsLink(organization_id: string, options?: IMongooseOptions): Promise<string>
  updateSubscription(paddle_subscription_id: string, options?: IMongooseOptions): Promise<ISubscriptionEntity | null>
  changePlanSubscription(dto: ISubscriptionChangePlanRequest, options?: IMongooseOptions): Promise<ISubscriptionEntity | null>
}
