import { Types } from "mongoose"

import { IRepository } from ".."
import { IMongooseOptions, IUserEntity, IUserUpdateRequest } from "../../../../types"
import { logger } from "../../../../utils"
import { UserModel } from "./model"

export class UserRepository implements IRepository {
  async create(data: Partial<IUserEntity>, options?: IMongooseOptions): Promise<IUserEntity> {
    try {
      const user = new UserModel(data)
      await user.save({ session: options?.session || null })
      return user.toObject()
    } catch (error: unknown) {
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
      const user = await UserModel.findByIdAndUpdate(id, { $set: dto }, { new: true, session: options?.session || null })

      return user
    } catch (error: unknown) {
      logger.error(`update | error: ${error}`)
      throw error
    }
  }
}
