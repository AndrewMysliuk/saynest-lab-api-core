import { IRepository } from "../"
import { IStatistics } from "../../../../types"
import { StatisticsModel } from "./model"

export class CommunicationReviewRepository implements IRepository {
  async get(id: string): Promise<IStatistics | null> {
    return StatisticsModel.findById(id)
  }

  async list(filter: Partial<IStatistics> = {}): Promise<IStatistics[]> {
    return StatisticsModel.find(filter)
  }

  async add(statistics: IStatistics): Promise<IStatistics> {
    const created = new StatisticsModel(statistics)

    return created.save()
  }

  async delete(id: string): Promise<void> {
    await StatisticsModel.findByIdAndDelete(id)
  }
}
