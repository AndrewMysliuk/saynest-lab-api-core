import { IPromptService } from ".."
import { generateFinallyPrompt, transformSingleScenarioJson } from "../../..//utils"
import CheckingIntoHotelPrompt from "../../../json_prompt_data/checking_into_a_hotel.json"
import DiscussingTechnologyAIPrompt from "../../../json_prompt_data/discussing_technology_ai.json"
import ExplainingTechProjectSimplePrompt from "../../../json_prompt_data/explaining_tech_project_simple.json"
import GettingGymMembershipPrompt from "../../../json_prompt_data/getting_a_gym_membership.json"
import GettingHaircutPrompt from "../../../json_prompt_data/getting_a_haircut.json"
import VisitingOpticianPrompt from "../../../json_prompt_data/visiting_an_optician.json"
import { IPromptScenario } from "../../../types"

export class PromptService implements IPromptService {
  getPromptList(): IPromptScenario[] {
    return [
      {
        ...transformSingleScenarioJson(GettingGymMembershipPrompt),
        finally_prompt: generateFinallyPrompt(GettingGymMembershipPrompt),
      },
      {
        ...transformSingleScenarioJson(CheckingIntoHotelPrompt),
        finally_prompt: generateFinallyPrompt(CheckingIntoHotelPrompt),
      },
      {
        ...transformSingleScenarioJson(VisitingOpticianPrompt),
        finally_prompt: generateFinallyPrompt(VisitingOpticianPrompt),
      },
      {
        ...transformSingleScenarioJson(GettingHaircutPrompt),
        finally_prompt: generateFinallyPrompt(GettingHaircutPrompt),
      },
      {
        ...transformSingleScenarioJson(DiscussingTechnologyAIPrompt),
        finally_prompt: generateFinallyPrompt(DiscussingTechnologyAIPrompt),
      },
      {
        ...transformSingleScenarioJson(ExplainingTechProjectSimplePrompt),
        finally_prompt: generateFinallyPrompt(ExplainingTechProjectSimplePrompt),
      },
    ]
  }

  getById(id: string): IPromptScenario | null {
    const promptsList = this.getPromptList()

    return promptsList.find((prompt) => prompt.id === id) || null
  }
}
