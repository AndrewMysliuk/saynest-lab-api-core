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

      const isSandbox = process.env.NODE_ENV === "development"

      return plans.filter((item) => {
        if (item.is_public) {
          return true
        }
        if (isSandbox && item.name === PlanNameEnum.TEST) {
          return true
        }
        return false
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
