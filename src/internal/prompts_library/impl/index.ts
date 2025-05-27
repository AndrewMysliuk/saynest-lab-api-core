import { IPromptService } from ".."
import { generateFinallyPrompt, transformSingleModuleJson, transformSingleScenarioJson } from "../../..//utils"
import InterviewPreparationModule from "../../../json_module_data/interview_preparation.json"
import SandboxModule from "../../../json_module_data/sandbox.json"
import FinalAskUsSomething from "../../../json_scenario_data/interview_preparation/final_ask_us_something.json"
import FinalLearningAndGrowth from "../../../json_scenario_data/interview_preparation/final_learning_and_growth.json"
import FinalLongTermGoals from "../../../json_scenario_data/interview_preparation/final_long_term_goals.json"
import FinalTeamCultureFit from "../../../json_scenario_data/interview_preparation/final_team_culture_fit.json"
import HRCollaborationAndConflict from "../../../json_scenario_data/interview_preparation/hr_collaboration_and_conflict.json"
import HRCultureAndFit from "../../../json_scenario_data/interview_preparation/hr_culture_and_fit.json"
import HRIntroductionBasics from "../../../json_scenario_data/interview_preparation/hr_introduction_basics.json"
import HRMotivationExpectations from "../../../json_scenario_data/interview_preparation/hr_motivation_expectations.json"
import HRStrengthsChallenges from "../../../json_scenario_data/interview_preparation/hr_strengths_challenges.json"
import TechFrontendAPIIntegration from "../../../json_scenario_data/interview_preparation/tech_frontend_api_integration.json"
import TechFrontendEventLoop from "../../../json_scenario_data/interview_preparation/tech_frontend_event_loop.json"
import TechFrontendHTMLCSSBasics from "../../../json_scenario_data/interview_preparation/tech_frontend_html_css_basics.json"
import TechFrontendJavascriptVariables from "../../../json_scenario_data/interview_preparation/tech_frontend_javascript_variables.json"
import TechFrontendProjectStructure from "../../../json_scenario_data/interview_preparation/tech_frontend_project_structure.json"
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
    ...transformSingleModuleJson(InterviewPreparationModule),
  },
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
  // HR
  {
    ...transformSingleScenarioJson(HRIntroductionBasics),
    finally_prompt: generateFinallyPrompt(HRIntroductionBasics),
  },
  {
    ...transformSingleScenarioJson(HRMotivationExpectations),
    finally_prompt: generateFinallyPrompt(HRMotivationExpectations),
  },
  {
    ...transformSingleScenarioJson(HRStrengthsChallenges),
    finally_prompt: generateFinallyPrompt(HRStrengthsChallenges),
  },
  {
    ...transformSingleScenarioJson(HRCollaborationAndConflict),
    finally_prompt: generateFinallyPrompt(HRCollaborationAndConflict),
  },
  {
    ...transformSingleScenarioJson(HRCultureAndFit),
    finally_prompt: generateFinallyPrompt(HRCultureAndFit),
  },

  // Final
  {
    ...transformSingleScenarioJson(FinalAskUsSomething),
    finally_prompt: generateFinallyPrompt(FinalAskUsSomething),
  },
  {
    ...transformSingleScenarioJson(FinalLearningAndGrowth),
    finally_prompt: generateFinallyPrompt(FinalLearningAndGrowth),
  },
  {
    ...transformSingleScenarioJson(FinalLongTermGoals),
    finally_prompt: generateFinallyPrompt(FinalLongTermGoals),
  },
  {
    ...transformSingleScenarioJson(FinalTeamCultureFit),
    finally_prompt: generateFinallyPrompt(FinalTeamCultureFit),
  },

  // Tech Frontend
  {
    ...transformSingleScenarioJson(TechFrontendHTMLCSSBasics),
    finally_prompt: generateFinallyPrompt(TechFrontendHTMLCSSBasics),
  },
  {
    ...transformSingleScenarioJson(TechFrontendJavascriptVariables),
    finally_prompt: generateFinallyPrompt(TechFrontendJavascriptVariables),
  },
  {
    ...transformSingleScenarioJson(TechFrontendEventLoop),
    finally_prompt: generateFinallyPrompt(TechFrontendEventLoop),
  },
  {
    ...transformSingleScenarioJson(TechFrontendProjectStructure),
    finally_prompt: generateFinallyPrompt(TechFrontendProjectStructure),
  },
  {
    ...transformSingleScenarioJson(TechFrontendAPIIntegration),
    finally_prompt: generateFinallyPrompt(TechFrontendAPIIntegration),
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
    const module = MODULES.find((m) => m.id === module_id)
    if (!module) return []

    const scenarioIds = new Set(module.scenarios)
    return SCENARIOS.filter((scenario) => scenarioIds.has(scenario.id))
  }

  getById(id: string): IPromptScenario | null {
    const promptsList = this.getPromptList()

    return promptsList.find((prompt) => prompt.id === id) || null
  }
}
