import { IMongooseOptions, IStatistics } from "../../../types"

export interface IRepository {
  get(id: string, options?: IMongooseOptions): Promise<IStatistics | null>
  getBySessionId(session_id: string, options?: IMongooseOptions): Promise<IStatistics | null>
  list(options?: IMongooseOptions): Promise<IStatistics[]>
  add(statistics: Partial<IStatistics>, options?: IMongooseOptions): Promise<IStatistics>
  delete(id: string, options?: IMongooseOptions): Promise<void>
}
