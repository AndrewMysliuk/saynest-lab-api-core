import { Types } from "mongoose"

import { IRepository } from ".."
import { IMongooseOptions, IUserEntity, UserRoleEnum } from "../../../../types"
import { UserModel } from "./model"

export class UserRepository implements IRepository {
  async create(data: Partial<IUserEntity>, options?: IMongooseOptions): Promise<IUserEntity> {
    const user = new UserModel({
      organization_id: data.organization_id,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      country: data.country,
      role: data.role || "user",
      updated_at: new Date(),
      created_at: new Date(),
    })

    await user.save({ session: options?.session })

    return user.toObject()
  }

  async getById(id: string, options?: IMongooseOptions): Promise<IUserEntity | null> {
    return UserModel.findById(new Types.ObjectId(id)).session(options?.session || null)
  }

  async getByEmail(email: string, options?: IMongooseOptions): Promise<IUserEntity | null> {
    return UserModel.findOne({ email: email.toLowerCase() }).session(options?.session || null)
  }

  async listByOrganization(org_id: string, options?: IMongooseOptions): Promise<IUserEntity[]> {
    return UserModel.find({ organization_id: new Types.ObjectId(org_id) })
      .sort({ created_at: -1 })
      .session(options?.session || null)
  }

  async listAll(options?: IMongooseOptions): Promise<IUserEntity[]> {
    return UserModel.find()
      .sort({ created_at: -1 })
      .session(options?.session || null)
  }

  async updateRole(user_id: string, role: UserRoleEnum, options?: IMongooseOptions): Promise<IUserEntity> {
    const user = await UserModel.findByIdAndUpdate(new Types.ObjectId(user_id), { role }, { new: true }).session(options?.session || null)

    if (!user) {
      throw new Error("User not found")
    }

    return user.toObject()
  }
}
