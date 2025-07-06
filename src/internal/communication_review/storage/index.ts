import { ICommunicationReview, ICommunicationReviewFilters, IMongooseOptions, IPagination } from "../../../types"

export interface IRepository {
  get(id: string, user_id: string, options?: IMongooseOptions): Promise<ICommunicationReview | null>
  getBySessionId(session_id: string, options?: IMongooseOptions): Promise<ICommunicationReview | null>
  list(user_id: string, filter?: ICommunicationReviewFilters, pagination?: IPagination, options?: IMongooseOptions): Promise<ICommunicationReview[]>
  add(statistics: Partial<ICommunicationReview>, options?: IMongooseOptions): Promise<ICommunicationReview>
  update(id: string, user_id: string, updates: Partial<ICommunicationReview>, options?: IMongooseOptions): Promise<ICommunicationReview | null>
  delete(id: string, user_id: string, options?: IMongooseOptions): Promise<ICommunicationReview | null>
  deleteAllHistoryByUserId(user_id: string, options?: IMongooseOptions): Promise<void>
  generateReviewPublicId(id: string, user_id: string, public_id: string, options?: IMongooseOptions): Promise<void>
  getReviewByPublicId(public_id: string, options?: IMongooseOptions): Promise<ICommunicationReview | null>
}
