import { IPromptScenario } from "../../types"

export interface IPromptService {
  getPromptList: () => IPromptScenario[]
  getById: (id: string) => IPromptScenario | null
}
