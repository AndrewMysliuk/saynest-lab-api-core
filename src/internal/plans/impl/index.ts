import { IPlanService } from ".."
import { IMongooseOptions, IPlanEntity } from "../../../types"
import { createScopedLogger } from "../../../utils"
import { IRepository } from "../storage"

const log = createScopedLogger("PlanService")

export class PlanService implements IPlanService {
  private readonly planRepo: IRepository

  constructor(planRepo: IRepository) {
    this.planRepo = planRepo
  }

  async create(data: Partial<IPlanEntity>, options?: IMongooseOptions): Promise<IPlanEntity> {
    try {
      const plan = await this.planRepo.create(data, options)

      return plan
    } catch (error: unknown) {
      log.error("create", "error", { error })
      throw error
    }
  }

  async publicList(options?: IMongooseOptions): Promise<IPlanEntity[]> {
    try {
      const plans = await this.planRepo.list(options)

      return plans.filter((item) => item.is_public)
    } catch (error: unknown) {
      log.error("publicList", "error", { error })
      throw error
    }
  }
}
