import { IPlanService } from ".."
import { IMongooseOptions, IPlanEntity, PlanNameEnum } from "../../../types"
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

      const isProd = process.env.NODE_ENV === "production"

      return plans.filter((item) => {
        const isTestPlan = item.name === PlanNameEnum.TEST

        if (isProd && isTestPlan) {
          return false
        }

        return item.is_public || (!isProd && isTestPlan)
      })
    } catch (error: unknown) {
      log.error("publicList", "error", { error })
      throw error
    }
  }

  async getById(id: string, options?: IMongooseOptions): Promise<IPlanEntity | null> {
    try {
      return this.planRepo.getById(id, options)
    } catch (error: unknown) {
      log.error("getById", "error", { error })
      throw error
    }
  }
}
