import { Types } from "mongoose"

import { IRepository } from ".."
import { IMongooseOptions, IUserEntity, IUserUpdateRequest, UserRoleEnum } from "../../../../types"
import { logger } from "../../../../utils"
import { UserModel } from "./model"

export class UserRepository implements IRepository {
  async create(data: Partial<IUserEntity>, options?: IMongooseOptions): Promise<IUserEntity> {
    try {
      if (data.role === UserRoleEnum.SUPER_USER) {
        throw new Error("Cannot set SUPER_USER role")
      }

      const user = new UserModel(data)
      await user.save({ session: options?.session || null })

      return user.toObject()
    } catch (error: any) {
      if (error?.code === 11000 && error?.keyPattern?.email) {
        throw new Error("Email already exists")
      }

      logger.error(`create | error: ${error}`)
      throw error
    }
  }

  async getById(id: string, options?: IMongooseOptions): Promise<IUserEntity | null> {
    try {
      const user = await UserModel.findById(new Types.ObjectId(id)).session(options?.session || null)

      return user
    } catch (error: unknown) {
      logger.error(`getById | error: ${error}`)
      throw error
    }
  }

  async getByEmail(email: string, options?: IMongooseOptions): Promise<IUserEntity | null> {
    try {
      const user = await UserModel.findOne({ email }).session(options?.session || null)

      return user
    } catch (error: unknown) {
      logger.error(`getByEmail | error: ${error}`)
      throw error
    }
  }

  async listByOrganization(organization_id: string, options?: IMongooseOptions): Promise<IUserEntity[]> {
    try {
      const users = await UserModel.find({ organization_id: new Types.ObjectId(organization_id) }).session(options?.session || null)

      return users
    } catch (error: unknown) {
      logger.error(`listByOrganization | error: ${error}`)
      throw error
    }
  }

  async listAll(options?: IMongooseOptions): Promise<IUserEntity[]> {
    try {
      const users = await UserModel.find().session(options?.session || null)

      return users
    } catch (error: unknown) {
      logger.error(`listAll | error: ${error}`)
      throw error
    }
  }

  async update(id: string, dto: IUserUpdateRequest, options?: IMongooseOptions): Promise<IUserEntity | null> {
    try {
      if (dto.role === UserRoleEnum.SUPER_USER) {
        throw new Error("Cannot set SUPER_USER role")
      }

      const user = await UserModel.findByIdAndUpdate(id, { $set: dto }, { new: true, session: options?.session || null }).lean()

      return user
    } catch (error: unknown) {
      logger.error(`update | error: ${error}`)
      throw error
    }
  }

  async acceptUserPolicies(userId: string, options?: IMongooseOptions): Promise<IUserEntity | null> {
    try {
      const user = await UserModel.findByIdAndUpdate(
        new Types.ObjectId(userId),
        {
          $set: {
            "settings.is_accept_terms_and_conditions": true,
            "settings.is_accept_privacy_policy": true,
            "settings.is_accept_refund_policy": true,
          },
        },
        { new: true, session: options?.session || null },
      ).lean()

      return user
    } catch (error: unknown) {
      logger.error(`acceptUserPolicies | error: ${error}`)
      throw error
    }
  }
}
