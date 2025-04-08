import { Types } from "mongoose"

import { IRepository } from ".."
import { IOrganizationEntity } from "../../../../types"
import { OrganizationModel } from "./model"

export class OrganisationRepository implements IRepository {
  async create(data: Partial<IOrganizationEntity>): Promise<IOrganizationEntity> {
    const organization = await OrganizationModel.create({
      name: data.name,
      owner_id: data.owner_id,
      updated_at: new Date(),
      created_at: new Date(),
    })

    return organization.toObject()
  }

  async getById(id: string): Promise<IOrganizationEntity | null> {
    return OrganizationModel.findById(new Types.ObjectId(id))
  }

  async getByOwnerId(owner_id: string): Promise<IOrganizationEntity | null> {
    return OrganizationModel.findOne({ owner_id: new Types.ObjectId(owner_id) })
  }

  async list(): Promise<IOrganizationEntity[]> {
    return OrganizationModel.find().sort({ created_at: -1 })
  }
}
