import { IGPTPayload, ISimulationDialogResponse } from "../../types"

export interface ITextAnalysis {
  streamGptReplyOnly(payload: IGPTPayload): AsyncGenerator<string, void, unknown>
  createScenarioDialog(payload: IGPTPayload): Promise<ISimulationDialogResponse>
}
