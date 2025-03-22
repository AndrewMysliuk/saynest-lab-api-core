import { IErrorAnalysisResponse, IGPTPayload } from "../../types"

export interface IErrorAnalysis {
  conversationErrorAnalysis(payload: IGPTPayload): Promise<IErrorAnalysisResponse>
}
