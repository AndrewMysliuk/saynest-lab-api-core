import { Types } from "mongoose"

import { IRepository } from ".."
import { IMongooseOptions, ISubscriptionEntity, SubscriptionTypeEnum } from "../../../../types"
import { createScopedLogger } from "../../../../utils"
import { SubscriptionModel } from "./model"

const log = createScopedLogger("SubscriptionRepository")

export class SubscriptionRepository implements IRepository {
  async create(data: Partial<ISubscriptionEntity>, options?: IMongooseOptions): Promise<ISubscriptionEntity> {
    try {
      const sub = new SubscriptionModel(data)

      await sub.save({ session: options?.session || null })

      return sub.toObject()
    } catch (error: unknown) {
      log.error("create", "error", { error })
      throw error
    }
  }

  async getById(id: string, options?: IMongooseOptions): Promise<ISubscriptionEntity | null> {
    try {
      const sub = await SubscriptionModel.findById(new Types.ObjectId(id), null, options).lean<ISubscriptionEntity>().exec()
      return sub
    } catch (error: unknown) {
      log.error("getById", "error", { error })
      throw error
    }
  }

  async getByPaddleSubscriptionId(paddle_subscription_id: string, options?: IMongooseOptions): Promise<ISubscriptionEntity | null> {
    try {
      const sub = await SubscriptionModel.findOne({ paddle_subscription_id }, null, options).lean<ISubscriptionEntity>().exec()
      return sub
    } catch (error: unknown) {
      log.error("getByPaddleSubscriptionId", "error", { error })
      throw error
    }
  }

  async list(options?: IMongooseOptions): Promise<ISubscriptionEntity[]> {
    try {
      const subs = await SubscriptionModel.find({}, null, options).lean<ISubscriptionEntity[]>().exec()

      return subs
    } catch (error: unknown) {
      log.error("list", "error", { error })
      throw error
    }
  }

  async update(id: string, dto: Partial<ISubscriptionEntity>, options?: IMongooseOptions): Promise<ISubscriptionEntity | null> {
    try {
      const updatedSub = await SubscriptionModel.findByIdAndUpdate(new Types.ObjectId(id), { $set: dto }, { new: true, ...options })
        .lean<ISubscriptionEntity>()
        .exec()

      return updatedSub
    } catch (error: unknown) {
      log.error("update", "error", { error })
      throw error
    }
  }

  async setStatus(id: string, status: SubscriptionTypeEnum, options?: IMongooseOptions): Promise<ISubscriptionEntity | null> {
    try {
      const updatedSub = await SubscriptionModel.findByIdAndUpdate(new Types.ObjectId(id), { $set: { status } }, { new: true, ...options })
        .lean<ISubscriptionEntity>()
        .exec()

      return updatedSub
    } catch (error) {
      log.error("setStatus", "error", { error })
      throw error
    }
  }

  async getByOrganizationId(organization_id: string, options?: IMongooseOptions): Promise<ISubscriptionEntity | null> {
    try {
      const sub = await SubscriptionModel.findOne({ organization_id: new Types.ObjectId(organization_id) }, null, options)
        .lean<ISubscriptionEntity>()
        .exec()

      return sub
    } catch (error: unknown) {
      log.error("getByOrganizationId", "error", { error })
      throw error
    }
  }
}
