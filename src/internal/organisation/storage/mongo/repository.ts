import { Types } from "mongoose"

import { IRepository } from ".."
import { IMongooseOptions, IOrganizationEntity, IOrganizationUpdateRequest } from "../../../../types"
import { createScopedLogger } from "../../../../utils"
import { OrganizationModel } from "./model"

const log = createScopedLogger("OrganisationRepository")

export class OrganisationRepository implements IRepository {
  async create(data: Partial<IOrganizationEntity>, options?: IMongooseOptions): Promise<IOrganizationEntity> {
    try {
      const organization = new OrganizationModel(data)
      await organization.save({ session: options?.session || null })
      return organization.toObject()
    } catch (error: unknown) {
      log.error("create", "error", { error })
      throw error
    }
  }

  async getById(id: string, options?: IMongooseOptions): Promise<IOrganizationEntity | null> {
    try {
      const organization = await OrganizationModel.findById(new Types.ObjectId(id)).session(options?.session || null)

      return organization
    } catch (error: unknown) {
      log.error("getById", "error", { error })
      throw error
    }
  }

  async getByOwnerId(owner_id: string, options?: IMongooseOptions): Promise<IOrganizationEntity | null> {
    try {
      const organization = await OrganizationModel.findOne({ owner_id: new Types.ObjectId(owner_id) }).session(options?.session || null)

      return organization
    } catch (error: unknown) {
      log.error("getByOwnerId", "error", { error })
      throw error
    }
  }

  async list(options?: IMongooseOptions): Promise<IOrganizationEntity[]> {
    try {
      const organizations = await OrganizationModel.find().session(options?.session || null)

      return organizations
    } catch (error: unknown) {
      log.error("list", "error", { error })
      throw error
    }
  }

  async update(id: string, dto: IOrganizationUpdateRequest, options?: IMongooseOptions): Promise<IOrganizationEntity | null> {
    try {
      const organization = await OrganizationModel.findByIdAndUpdate(id, { $set: dto }, { new: true, session: options?.session || null })

      return organization
    } catch (error: unknown) {
      log.error("update", "error", { error })
      throw error
    }
  }
}
