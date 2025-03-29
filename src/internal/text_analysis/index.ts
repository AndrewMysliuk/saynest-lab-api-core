import { IGPTPayload, ISimulationDialogResponse, ITextAnalysisResponse } from "../../types"

export interface ITextAnalysis {
  gptConversation(payload: IGPTPayload): Promise<ITextAnalysisResponse>
  createScenarioDialog(payload: IGPTPayload): Promise<ISimulationDialogResponse>
}
