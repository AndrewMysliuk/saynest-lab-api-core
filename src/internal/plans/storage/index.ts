import { IMongooseOptions, IPlanEntity, PlanStatusEnum } from "../../../types"

export interface IRepository {
  create(data: Partial<IPlanEntity>, options?: IMongooseOptions): Promise<IPlanEntity>
  getById(id: string, options?: IMongooseOptions): Promise<IPlanEntity | null>
  list(options?: IMongooseOptions): Promise<IPlanEntity[]>
  update(id: string, dto: Partial<IPlanEntity>, options?: IMongooseOptions): Promise<IPlanEntity | null>
  setDiactivatedStatus(id: string, status: PlanStatusEnum, options?: IMongooseOptions): Promise<IPlanEntity | null>
}
