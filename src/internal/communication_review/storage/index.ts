import { IMongooseOptions, IStatistics } from "../../../types"

export interface IRepository {
  get(id: string, user_id: string, options?: IMongooseOptions): Promise<IStatistics | null>
  getBySessionId(session_id: string, options?: IMongooseOptions): Promise<IStatistics | null>
  list(user_id: string, options?: IMongooseOptions): Promise<IStatistics[]>
  add(statistics: Partial<IStatistics>, options?: IMongooseOptions): Promise<IStatistics>
  update(id: string, user_id: string, updates: Partial<IStatistics>, options?: IMongooseOptions): Promise<IStatistics | null>
  delete(id: string, user_id: string, options?: IMongooseOptions): Promise<IStatistics | null>
}
