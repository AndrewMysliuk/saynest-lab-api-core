import { ISubscriptionService } from ".."
import { IMongooseOptions, ISubscriptionEntity } from "../../../types"
import { createScopedLogger } from "../../../utils"
import { IRepository } from "../storage"

const log = createScopedLogger("SubscriptionService")

export class SubscriptionService implements ISubscriptionService {
  private readonly subscriptionRepo: IRepository

  constructor(subscriptionRepo: IRepository) {
    this.subscriptionRepo = subscriptionRepo
  }

  async create(data: Partial<ISubscriptionEntity>, options?: IMongooseOptions): Promise<ISubscriptionEntity> {
    try {
      const sub = await this.subscriptionRepo.create(data, options)

      return sub
    } catch (error: unknown) {
      log.error("create", "error", { error })
      throw error
    }
  }

  async getByOrganizationId(organization_id: string, options?: IMongooseOptions): Promise<ISubscriptionEntity | null> {
    try {
      const sub = await this.subscriptionRepo.getByOrganizationId(organization_id, options)

      return sub
    } catch (error: unknown) {
      log.error("getByOrganizationId", "error", { error })
      throw error
    }
  }
}
