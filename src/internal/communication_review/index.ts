import { IStatistics, IStatisticsGenerateRequest, IStatisticsUpdateAudioUrl } from "../../types"

export interface ICommunicationReviewService {
  generateConversationReview(user_id: string, organization_id: string, dto: IStatisticsGenerateRequest): Promise<IStatistics>
  reviewsList(user_id: string): Promise<IStatistics[]>
  deleteReview(review_id: string, user_id: string): Promise<void>
  getReview(id: string, user_id: string): Promise<IStatistics>
  updateAudioUrl(dto: IStatisticsUpdateAudioUrl): Promise<string>
}
