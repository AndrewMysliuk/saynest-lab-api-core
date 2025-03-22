import { IGPTPayload, ITextAnalysisResponse } from "../../types"

export interface ITextAnalysis {
  gptConversation(payload: IGPTPayload): Promise<ITextAnalysisResponse>
}
