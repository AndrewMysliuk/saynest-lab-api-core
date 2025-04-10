import { IStatistics } from "../../../types"

export interface IRepository {
  get(id: string): Promise<IStatistics | null>
  list(): Promise<IStatistics[]>
  add(statistics: IStatistics): Promise<IStatistics>
  delete(id: string): Promise<void>
}
