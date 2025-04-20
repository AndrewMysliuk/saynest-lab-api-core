import { IGPTPayload, ISimulationDialogResponse } from "../../types"

export interface ITextAnalysis {
  streamGptReplyOnly(payload: IGPTPayload, prompt_id: string): AsyncGenerator<string, void, unknown>
  createScenarioDialog(payload: IGPTPayload): Promise<ISimulationDialogResponse>
}
