import { IStatistics, IStatisticsGenerateRequest } from "../../types"

export interface ICommunicationReviewService {
  generateConversationReview(dto: IStatisticsGenerateRequest): Promise<IStatistics>
  reviewsList(): Promise<IStatistics[]>
  deleteReview(id: string): Promise<void>
  getReview(id: string): Promise<IStatistics>
}
