import { IModuleScenario, IPromptScenario } from "../../types"

export interface IPromptService {
  getPromptList: () => IPromptScenario[]
  getModuleList: () => IModuleScenario[]
  getModuleScenarios: (module_id: string) => IPromptScenario[]
  getById: (id: string) => IPromptScenario | null
}
