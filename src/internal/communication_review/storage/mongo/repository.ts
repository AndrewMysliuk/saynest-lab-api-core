import { IRepository } from "../"
import { IMongooseOptions, IStatistics } from "../../../../types"
import { StatisticsModel } from "./model"

export class CommunicationReviewRepository implements IRepository {
  async get(id: string, options?: IMongooseOptions): Promise<IStatistics | null> {
    return StatisticsModel.findById(id).session(options?.session || null)
  }

  async getBySessionId(session_id: string, options?: IMongooseOptions): Promise<IStatistics | null> {
    return StatisticsModel.findOne({ session_id }).session(options?.session || null)
  }

  async list(options?: IMongooseOptions): Promise<IStatistics[]> {
    return StatisticsModel.find()
      .sort({ created_at: -1 })
      .session(options?.session || null)
  }

  async add(statistics: Partial<IStatistics>, options?: IMongooseOptions): Promise<IStatistics> {
    const created = new StatisticsModel(statistics)

    return created.save({ session: options?.session })
  }

  async delete(id: string, options?: IMongooseOptions): Promise<IStatistics | null> {
    return StatisticsModel.findByIdAndDelete(id).session(options?.session || null)
  }
}
