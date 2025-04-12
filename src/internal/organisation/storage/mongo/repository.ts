import { Types } from "mongoose"

import { IRepository } from ".."
import { IMongooseOptions, IOrganizationEntity } from "../../../../types"
import { OrganizationModel } from "./model"

export class OrganisationRepository implements IRepository {
  async create(data: Partial<IOrganizationEntity>, options?: IMongooseOptions): Promise<IOrganizationEntity> {
    const organization = new OrganizationModel({
      name: data.name,
      owner_id: data.owner_id,
      updated_at: new Date(),
      created_at: new Date(),
    })

    await organization.save({ session: options?.session })

    return organization.toObject()
  }

  async getById(id: string, options?: IMongooseOptions): Promise<IOrganizationEntity | null> {
    return OrganizationModel.findById(new Types.ObjectId(id)).session(options?.session || null)
  }

  async getByOwnerId(owner_id: string, options?: IMongooseOptions): Promise<IOrganizationEntity | null> {
    return OrganizationModel.findOne({ owner_id: new Types.ObjectId(owner_id) }).session(options?.session || null)
  }

  async list(options?: IMongooseOptions): Promise<IOrganizationEntity[]> {
    return OrganizationModel.find()
      .sort({ created_at: -1 })
      .session(options?.session || null)
  }
}
