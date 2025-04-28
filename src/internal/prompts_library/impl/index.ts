import { IPromptService } from ".."
import { generateFinallyPrompt, transformSingleModuleJson, transformSingleScenarioJson } from "../../..//utils"
import CoreConversationalStructuresModule from "../../../json_module_data/core_conversational_structures.json"
import SandboxModule from "../../../json_module_data/sandbox.json"
import LinkingIdeasClearlyPrompt from "../../../json_scenario_data/core_conversational_structures/1_linking_ideas_clearly.json"
import StatingOpinionsComparingPrompt from "../../../json_scenario_data/core_conversational_structures/2_stating_opinions_comparing.json"
import OrganizingYourThoughts from "../../../json_scenario_data/core_conversational_structures/3_organizing_your_thoughts.json"
import ClarifyingAndRephrasing from "../../../json_scenario_data/core_conversational_structures/4_clarifying_and_rephrasing.json"
import ExplainingCauseAndEffect from "../../../json_scenario_data/core_conversational_structures/5_explaining_cause_and_effect.json"
import AgreeingDisagreeingReacting from "../../../json_scenario_data/core_conversational_structures/6_agreeing_disagreeing_reacting.json"
import BuyingTimeThinkingOutLoud from "../../../json_scenario_data/core_conversational_structures/7_buying_time_thinking_out_loud.json"
import CheckingIntoHotelPrompt from "../../../json_scenario_data/sandbox/checking_into_a_hotel.json"
import GettingGymMembershipPrompt from "../../../json_scenario_data/sandbox/getting_a_gym_membership.json"
import RentingCarPrompt from "../../../json_scenario_data/sandbox/renting_a_car.json"
import StartupPitchPresentationPrompt from "../../../json_scenario_data/sandbox/startup_pitch_presentation.json"
import TravelingAtTheAirportPrompt from "../../../json_scenario_data/sandbox/traveling_at_the_airport.json"
import VisitingOpticianPrompt from "../../../json_scenario_data/sandbox/visiting_an_optician.json"
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
  // Sandbox
  {
    ...transformSingleScenarioJson(RentingCarPrompt),
    finally_prompt: generateFinallyPrompt(RentingCarPrompt),
  },
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
    ...transformSingleScenarioJson(TravelingAtTheAirportPrompt),
    finally_prompt: generateFinallyPrompt(TravelingAtTheAirportPrompt),
  },
  {
    ...transformSingleScenarioJson(StartupPitchPresentationPrompt),
    finally_prompt: generateFinallyPrompt(StartupPitchPresentationPrompt),
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
