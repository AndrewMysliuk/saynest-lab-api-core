import { IGPTPayload } from "../../types"

export interface ITextAnalysis {
  streamGptReplyOnly(payload: IGPTPayload, finally_prompt: string): AsyncGenerator<string, void, unknown>
}
