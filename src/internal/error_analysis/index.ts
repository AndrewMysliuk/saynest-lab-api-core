import { IErrorAnalysisEntity, IErrorAnalysisRequest } from "../../types"

export interface IErrorAnalysis {
  conversationErrorAnalysis(dto: IErrorAnalysisRequest): Promise<IErrorAnalysisEntity | null>
  listConversationErrors(session_id: string): Promise<IErrorAnalysisEntity[]>
  deleteAllBySessionId(session_id: string): Promise<void>
}
