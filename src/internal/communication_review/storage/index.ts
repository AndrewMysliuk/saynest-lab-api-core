import { IMongooseOptions, ICommunicationReview } from "../../../types"

export interface IRepository {
  get(id: string, user_id: string, options?: IMongooseOptions): Promise<ICommunicationReview | null>
  getBySessionId(session_id: string, options?: IMongooseOptions): Promise<ICommunicationReview | null>
  list(user_id: string, options?: IMongooseOptions): Promise<ICommunicationReview[]>
  add(statistics: Partial<ICommunicationReview>, options?: IMongooseOptions): Promise<ICommunicationReview>
  update(id: string, user_id: string, updates: Partial<ICommunicationReview>, options?: IMongooseOptions): Promise<ICommunicationReview | null>
  delete(id: string, user_id: string, options?: IMongooseOptions): Promise<ICommunicationReview | null>
}
