import { ICommunicationReview, ICommunicationReviewGenerateRequest, ICommunicationReviewUpdateAudioUrl } from "../../types"

export interface ICommunicationReviewService {
  generateConversationReview(user_id: string, organization_id: string, dto: ICommunicationReviewGenerateRequest): Promise<ICommunicationReview>
  reviewsList(user_id: string): Promise<ICommunicationReview[]>
  deleteReview(review_id: string, user_id: string): Promise<void>
  getReview(id: string, user_id: string): Promise<ICommunicationReview>
  updateAudioUrl(dto: ICommunicationReviewUpdateAudioUrl): Promise<string>
}
