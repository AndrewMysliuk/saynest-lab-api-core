import { IStatistics, IStatisticsGenerateRequest } from "../../types"

export interface ICommunicationReviewService {
  generateConversationReview(user_id: string, organization_id: string, dto: IStatisticsGenerateRequest): Promise<IStatistics>
  reviewsList(): Promise<IStatistics[]>
  deleteReview(review_id: string): Promise<void>
  getReview(id: string): Promise<IStatistics>
}
