import { IUserEntity, UserRoleEnum } from "../../../types"

export interface IRepository {
  create(data: Partial<IUserEntity>): Promise<IUserEntity>
  getById(id: string): Promise<IUserEntity | null>
  getByEmail(email: string): Promise<IUserEntity | null>
  listByOrganization(org_id: string): Promise<IUserEntity[]>
  listAll(): Promise<IUserEntity[]>
  updateRole(user_id: string, role: UserRoleEnum): Promise<IUserEntity>
}
