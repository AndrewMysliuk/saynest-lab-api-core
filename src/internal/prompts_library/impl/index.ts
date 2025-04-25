import { IPromptService } from ".."
import { generateFinallyPrompt, transformSingleModuleJson, transformSingleScenarioJson } from "../../..//utils"
import CoreConversationalStructuresModule from "../../../json_module_data/core_conversational_structures.json"
import SandboxModule from "../../../json_module_data/sandbox.json"
import CheckingIntoHotelPrompt from "../../../json_scenario_data/checking_into_a_hotel.json"
import LinkingIdeasClearlyPrompt from "../../../json_scenario_data/core_conversational_structures/1_linking_ideas_clearly.json"
import StatingOpinionsComparingPrompt from "../../../json_scenario_data/core_conversational_structures/2_stating_opinions_comparing.json"
import OrganizingYourThoughts from "../../../json_scenario_data/core_conversational_structures/3_organizing_your_thoughts.json"
import ClarifyingAndRephrasing from "../../../json_scenario_data/core_conversational_structures/4_clarifying_and_rephrasing.json"
import ExplainingCauseAndEffect from "../../../json_scenario_data/core_conversational_structures/5_explaining_cause_and_effect.json"
import AgreeingDisagreeingReacting from "../../../json_scenario_data/core_conversational_structures/6_agreeing_disagreeing_reacting.json"
import BuyingTimeThinkingOutLoud from "../../../json_scenario_data/core_conversational_structures/7_buying_time_thinking_out_loud.json"
import DiscussingTechnologyAIPrompt from "../../../json_scenario_data/discussing_technology_ai.json"
import ExplainingTechProjectSimplePrompt from "../../../json_scenario_data/explaining_tech_project_simple.json"
import GettingGymMembershipPrompt from "../../../json_scenario_data/getting_a_gym_membership.json"
import GettingHaircutPrompt from "../../../json_scenario_data/getting_a_haircut.json"
import VisitingOpticianPrompt from "../../../json_scenario_data/visiting_an_optician.json"
import { IModuleScenario, IPromptScenario } from "../../../types"

const MODULES = [
  {
    ...transformSingleModuleJson(SandboxModule),
  },
  {
    ...transformSingleModuleJson(CoreConversationalStructuresModule),
  },
]

const SCENARIOS = [
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
  // Core Conversational Structures
  {
    ...transformSingleScenarioJson(LinkingIdeasClearlyPrompt),
    finally_prompt: generateFinallyPrompt(LinkingIdeasClearlyPrompt),
  },
  {
    ...transformSingleScenarioJson(StatingOpinionsComparingPrompt),
    finally_prompt: generateFinallyPrompt(StatingOpinionsComparingPrompt),
  },
  {
    ...transformSingleScenarioJson(OrganizingYourThoughts),
    finally_prompt: generateFinallyPrompt(OrganizingYourThoughts),
  },
  {
    ...transformSingleScenarioJson(ClarifyingAndRephrasing),
    finally_prompt: generateFinallyPrompt(ClarifyingAndRephrasing),
  },
  {
    ...transformSingleScenarioJson(ExplainingCauseAndEffect),
    finally_prompt: generateFinallyPrompt(ExplainingCauseAndEffect),
  },
  {
    ...transformSingleScenarioJson(AgreeingDisagreeingReacting),
    finally_prompt: generateFinallyPrompt(AgreeingDisagreeingReacting),
  },
  {
    ...transformSingleScenarioJson(BuyingTimeThinkingOutLoud),
    finally_prompt: generateFinallyPrompt(BuyingTimeThinkingOutLoud),
  },
]

export class PromptService implements IPromptService {
  getPromptList(): IPromptScenario[] {
    return SCENARIOS
  }

  getModuleList(): IModuleScenario[] {
    return MODULES
  }

  getModuleScenarios(module_id: string): IPromptScenario[] {
    return SCENARIOS.filter((item) => item.module === module_id)
  }

  getById(id: string): IPromptScenario | null {
    const promptsList = this.getPromptList()

    return promptsList.find((prompt) => prompt.id === id) || null
  }
}
