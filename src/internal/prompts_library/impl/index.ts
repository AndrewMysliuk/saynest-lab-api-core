import { IPromptService } from ".."
import { generateFinallyPrompt, transformSingleScenarioJson } from "../../..//utils"
import GettingGymMembershipPrompt from "../../../json_prompt_data/getting_a_gym_membership.json"
import { IPromptScenario } from "../../../types"

export class PromptService implements IPromptService {
  getPromptList(): IPromptScenario[] {
    return [
      {
        ...transformSingleScenarioJson(GettingGymMembershipPrompt),
        finally_prompt: generateFinallyPrompt(GettingGymMembershipPrompt),
      },
    ]
  }

  getById(id: string): IPromptScenario | null {
    const promptsList = this.getPromptList()

    return promptsList.find((prompt) => prompt.id === id) || null
  }
}
