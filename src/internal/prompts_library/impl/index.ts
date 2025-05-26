import { IPromptService } from ".."
import { generateFinallyPrompt, transformSingleModuleJson, transformSingleScenarioJson } from "../../..//utils"
import SandboxModule from "../../../json_module_data/sandbox.json"
import ApplyingDigitalNomadVisaCyprusPrompt from "../../../json_scenario_data/sandbox/applying_digital_nomad_visa_cyprus.json"
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
]

const SCENARIOS = [
  // Sandbox
  {
    ...transformSingleScenarioJson(ApplyingDigitalNomadVisaCyprusPrompt),
    finally_prompt: generateFinallyPrompt(ApplyingDigitalNomadVisaCyprusPrompt),
  },
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
