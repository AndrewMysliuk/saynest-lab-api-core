import { ICommunicationReviewService } from ".."
import { IStatistics, IStatisticsGenerateRequest } from "../../../types"
import logger from "../../../utils/logger"
import { IRepository } from "../storage"

export class CommunicationReviewService implements ICommunicationReviewService {
  private readonly communicationReviewRepo: IRepository

  constructor(communicationReviewRepo: IRepository) {
    this.communicationReviewRepo = communicationReviewRepo
  }

  async generateConversationReview(dto: IStatisticsGenerateRequest): Promise<IStatistics> {
    try {
      // TODO

      return {} as IStatistics
    } catch (error: unknown) {
      logger.error(`generateConversationReview | error: ${error}`)
      throw error
    }
  }

  async reviewsList(): Promise<IStatistics[]> {
    try {
      return await this.communicationReviewRepo.list()
    } catch (error: unknown) {
      logger.error(`reviewsList | error: ${error}`)
      throw error
    }
  }

  async deleteReview(id: string): Promise<void> {
    try {
      await this.communicationReviewRepo.delete(id)
    } catch (error: unknown) {
      logger.error(`deleteReview | error: ${error}`)
      throw error
    }
  }

  async getReview(id: string): Promise<IStatistics> {
    try {
      const result = await this.communicationReviewRepo.get(id)

      if (!result) {
        throw new Error(`Review not found with id: ${id}`)
      }

      return result
    } catch (error: unknown) {
      logger.error(`getReview | error: ${error}`)
      throw error
    }
  }
}
