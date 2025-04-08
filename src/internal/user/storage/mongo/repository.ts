import { Types } from "mongoose"

import { IRepository } from ".."
import { IUserEntity, UserRoleEnum } from "../../../../types"
import { UserModel } from "./model"

export class UserRepository implements IRepository {
  async create(data: Partial<IUserEntity>): Promise<IUserEntity> {
    const user = await UserModel.create({
      organization_id: data.organization_id,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      country: data.country,
      role: data.role || "user",
      updated_at: new Date(),
      created_at: new Date(),
    })

    return user.toObject()
  }

  async getById(id: string): Promise<IUserEntity | null> {
    return UserModel.findById(new Types.ObjectId(id))
  }

  async getByEmail(email: string): Promise<IUserEntity | null> {
    return UserModel.findOne({ email: email.toLowerCase() })
  }

  async listByOrganization(org_id: string): Promise<IUserEntity[]> {
    return UserModel.find({ organization_id: new Types.ObjectId(org_id) }).sort({ created_at: -1 })
  }

  async listAll(): Promise<IUserEntity[]> {
    return UserModel.find().sort({ created_at: -1 })
  }

  async updateRole(user_id: string, role: UserRoleEnum): Promise<IUserEntity> {
    const user = await UserModel.findByIdAndUpdate(new Types.ObjectId(user_id), { role }, { new: true })

    if (!user) {
      throw new Error("User not found")
    }

    return user.toObject()
  }
}
