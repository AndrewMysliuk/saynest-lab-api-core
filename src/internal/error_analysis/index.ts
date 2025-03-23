import { IErrorAnalysisEntity, IGPTPayload } from "../../types"

export interface IErrorAnalysis {
  conversationErrorAnalysis(session_id: string, payload: IGPTPayload): Promise<IErrorAnalysisEntity | null>
}
