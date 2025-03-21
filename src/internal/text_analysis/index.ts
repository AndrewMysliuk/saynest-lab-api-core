import { IGPTPayload } from "../../types"

export interface ITextAnalysis {
  gptConversation(payload: IGPTPayload): Promise<any>
}
