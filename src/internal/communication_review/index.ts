import { IStatistics } from "../../types"

export interface ICommunicationReview {
  generateConversationReview(session_id: string): Promise<IStatistics>
  list(): Promise<IStatistics[]>
}
