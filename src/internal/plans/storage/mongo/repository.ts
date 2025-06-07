import { Types } from "mongoose"

import { IRepository } from ".."
import { IMongooseOptions, IPlanEntity, PlanStatusEnum } from "../../../../types"
import { createScopedLogger } from "../../../../utils"
import { PlanModel } from "./model"

const log = createScopedLogger("PlanRepository")

export class PlanRepository implements IRepository {
  async create(data: Partial<IPlanEntity>, options?: IMongooseOptions): Promise<IPlanEntity> {
    try {
      const plan = new PlanModel(data)

      await plan.save({ session: options?.session || null })

      return plan.toObject()
    } catch (error: unknown) {
      log.error("create", "error", {
        error,
      })
      throw error
    }
  }

  async getById(id: string, options?: IMongooseOptions): Promise<IPlanEntity | null> {
    try {
      const plan = await PlanModel.findById(new Types.ObjectId(id), null, options).lean<IPlanEntity>().exec()

      return plan
    } catch (error: unknown) {
      log.error("getById", "error", {
        error,
      })
      throw error
    }
  }

  async list(options?: IMongooseOptions): Promise<IPlanEntity[]> {
    try {
      const plans = await PlanModel.find().session(options?.session || null)

      return plans
    } catch (error: unknown) {
      log.error("list", "error", {
        error,
      })
      throw error
    }
  }

  async update(id: string, dto: Partial<IPlanEntity>, options?: IMongooseOptions): Promise<IPlanEntity | null> {
    try {
      const updatedPlan = await PlanModel.findByIdAndUpdate(new Types.ObjectId(id), { $set: dto }, { new: true, ...options })
        .lean<IPlanEntity>()
        .exec()

      return updatedPlan
    } catch (error: unknown) {
      log.error("update", "error", {
        error,
      })
      throw error
    }
  }

  async setDiactivatedStatus(id: string, status: PlanStatusEnum, options?: IMongooseOptions): Promise<IPlanEntity | null> {
    try {
      const updatedPlan = await PlanModel.findByIdAndUpdate(new Types.ObjectId(id), { $set: { status } }, { new: true, ...options })
        .lean<IPlanEntity>()
        .exec()

      return updatedPlan
    } catch (error: unknown) {
      log.error("setDiactivatedStatus", "error", {
        error,
      })
      throw error
    }
  }
}
