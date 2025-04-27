import { Types } from "mongoose"

import { IRepository } from ".."
import { IMongooseOptions, IRefreshTokenEntity } from "../../../../types"
import logger from "../../../../utils/logger"
import { RefreshTokenModel } from "./model"

export class AuthRepository implements IRepository {
  async create(data: Partial<IRefreshTokenEntity>, options?: IMongooseOptions): Promise<IRefreshTokenEntity> {
    try {
      const token = new RefreshTokenModel(data)
      await token.save({ session: options?.session || null })
      return token.toObject()
    } catch (error: unknown) {
      logger.error(`create | error: ${error}`)
      throw error
    }
  }

  async getByToken(token: string, options?: IMongooseOptions): Promise<IRefreshTokenEntity | null> {
    try {
      const tokenEntry = await RefreshTokenModel.findOne({ token }).session(options?.session || null)

      return tokenEntry
    } catch (error: unknown) {
      logger.error(`getByToken | error: ${error}`)
      throw error
    }
  }

  async deleteByToken(token: string, options?: IMongooseOptions): Promise<void> {
    try {
      await RefreshTokenModel.deleteOne({ token }).session(options?.session || null)
    } catch (error: unknown) {
      logger.error(`deleteByToken | error: ${error}`)
      throw error
    }
  }

  async deleteAllByUser(user_id: string, options?: IMongooseOptions): Promise<void> {
    try {
      await RefreshTokenModel.deleteMany({ user_id: new Types.ObjectId(user_id) }).session(options?.session || null)
    } catch (error: unknown) {
      logger.error(`deleteAllByUser | error: ${error}`)
      throw error
    }
  }

  async deleteAllExpired(current_date: Date, options?: IMongooseOptions): Promise<number> {
    try {
      const result = await RefreshTokenModel.deleteMany({
        expires_at: { $lt: current_date },
      }).session(options?.session || null)

      return result.deletedCount || 0
    } catch (error: unknown) {
      logger.error(`deleteAllExpired | error: ${error}`)
      throw error
    }
  }
}
