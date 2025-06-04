import { Types } from "mongoose"

import { IUserService } from ".."
import { IMongooseOptions, IUserCreateRequest, IUserEntity, IUserUpdateRequest } from "../../../types"
import { hashPassword, logger } from "../../../utils"
import { IRepository } from "../storage"

export class UserService implements IUserService {
  private readonly userRepo: IRepository

  constructor(userRepo: IRepository) {
    this.userRepo = userRepo
  }

  async create(dto: IUserCreateRequest, options?: IMongooseOptions): Promise<IUserEntity> {
    try {
      const hashedPassword = await hashPassword(dto.password)

      const organization_id = new Types.ObjectId(dto.organization_id)

      const user = await this.userRepo.create(
        {
          ...dto,
          organization_id,
          password: hashedPassword,
        },
        options,
      )

      return user
    } catch (error: unknown) {
      logger.error(`create | error: ${error}`)
      throw error
    }
  }

  async getByEmail(email: string, options?: IMongooseOptions): Promise<IUserEntity | null> {
    try {
      return this.userRepo.getByEmail(email, options)
    } catch (error: unknown) {
      logger.error(`getByEmail | error: ${error}`)
      throw error
    }
  }

  async getById(id: string, options?: IMongooseOptions): Promise<IUserEntity | null> {
    try {
      return this.userRepo.getById(id, options)
    } catch (error: unknown) {
      logger.error(`getById | error: ${error}`)
      throw error
    }
  }

  async update(id: string, dto: IUserUpdateRequest, options?: IMongooseOptions): Promise<IUserEntity | null> {
    try {
      return this.userRepo.update(id, dto, options)
    } catch (error: unknown) {
      logger.error(`update | error: ${error}`)
      throw error
    }
  }

  async acceptUserPolicies(userId: string, options?: IMongooseOptions): Promise<IUserEntity | null> {
    try {
      return this.userRepo.acceptUserPolicies(userId, options)
    } catch (error: unknown) {
      logger.error(`update | error: ${error}`)
      throw error
    }
  }
}
