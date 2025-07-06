import { ICommunicationReview, ICommunicationReviewFilters, ICommunicationReviewGenerateRequest, ICommunicationReviewUpdateAudioUrl, IMongooseOptions, IPagination } from "../../types"

export interface ICommunicationReviewService {
  generateConversationReview(user_id: string, organization_id: string, dto: ICommunicationReviewGenerateRequest): Promise<ICommunicationReview>
  reviewsList(user_id: string, filter?: ICommunicationReviewFilters, pagination?: IPagination): Promise<ICommunicationReview[]>
  deleteReview(review_id: string, user_id: string): Promise<void>
  deleteAllHistoryByUserId(org_id: string, user_id: string, options?: IMongooseOptions): Promise<void>
  getReview(id: string, user_id: string): Promise<ICommunicationReview>
  updateAudioUrl(dto: ICommunicationReviewUpdateAudioUrl): Promise<string>
  generateReviewPublicId(review_id: string, user_id: string): Promise<string>
  getReviewByPublicId(public_id: string): Promise<ICommunicationReview>
}
