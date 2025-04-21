import { IGPTPayload } from "../../types"

export interface ITextAnalysis {
  streamGptReplyOnly(payload: IGPTPayload, prompt_id: string): AsyncGenerator<string, void, unknown>
}
