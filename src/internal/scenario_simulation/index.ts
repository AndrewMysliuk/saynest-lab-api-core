import { ISimulationStartResponse, IStartSimulationRequest } from "../../types"

export interface IScenarioSimulationService {
  startSimulation(request: IStartSimulationRequest): Promise<ISimulationStartResponse>
}
