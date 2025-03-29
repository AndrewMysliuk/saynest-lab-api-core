import { ISimulationStartResponse, IStartSimulationRequest } from "../../types"

export interface IScenarioSimulationService {
  startSimulation(input: IStartSimulationRequest): Promise<ISimulationStartResponse>
}
