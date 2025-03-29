import { IScenarioSimulationService } from ".."
import { ISimulationStartResponse, IStartSimulationRequest } from "../../../types"
import logger from "../../../utils/logger"
import { ILanguageTheory } from "../../language_theory"
import { ITextAnalysis } from "../../text_analysis"
import { ITextToSpeach } from "../../text_to_speach"

export class ScenarioSimulationService implements IScenarioSimulationService {
  private readonly textAnalysisService: ITextAnalysis
  private readonly textToSpeachService: ITextToSpeach
  private readonly languageTheoryService: ILanguageTheory

  constructor(textAnalysisService: ITextAnalysis, textToSpeachService: ITextToSpeach, languageTheoryService: ILanguageTheory) {
    this.textAnalysisService = textAnalysisService
    this.textToSpeachService = textToSpeachService
    this.languageTheoryService = languageTheoryService
  }

  async startSimulation(input: IStartSimulationRequest): Promise<ISimulationStartResponse> {
    try {
      // TODO

      return {} as ISimulationStartResponse
    } catch (error: unknown) {
      logger.error(`ConversationService | error in startSimulation: ${error}`)
      throw error
    }
  }
}
