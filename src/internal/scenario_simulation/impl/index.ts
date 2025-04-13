import { v4 as uuidv4 } from "uuid"

import { IScenarioSimulationService } from ".."
import { GPTRoleType, ISimulationStartResponse, IStartSimulationRequest } from "../../../types"
import logger from "../../../utils/logger"
import { ILanguageTheory } from "../../language_theory"
import { ITextAnalysis } from "../../text_analysis"
import { ITextToSpeach } from "../../text_to_speach"
import { buildSystemPrompt, buildUserPrompt } from "./prompt"

export class ScenarioSimulationService implements IScenarioSimulationService {
  private readonly textAnalysisService: ITextAnalysis
  private readonly textToSpeachService: ITextToSpeach
  private readonly languageTheoryService: ILanguageTheory

  constructor(textAnalysisService: ITextAnalysis, textToSpeachService: ITextToSpeach, languageTheoryService: ILanguageTheory) {
    this.textAnalysisService = textAnalysisService
    this.textToSpeachService = textToSpeachService
    this.languageTheoryService = languageTheoryService
  }

  async startSimulation(request: IStartSimulationRequest): Promise<ISimulationStartResponse> {
    try {
      const topics = await this.languageTheoryService.filteredShortListByLanguage(request.language, {
        topic_ids: [],
        topic_titles: [],
        level_cefr: [],
      })

      const systemPrompt = buildSystemPrompt(request, topics)
      const userPrompt = buildUserPrompt(request)
      const messages: Array<{ role: GPTRoleType; content: string }> = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ]

      const response = await this.textAnalysisService.createScenarioDialog({
        model: "gpt-4o",
        temperature: 0.7,
        max_tokens: 2500,
        stream: false,
        messages,
      })

      if (request.is_audio_needed) {
        response.dialogue_preview = await this.textToSpeachService.ttsTextToSpeechDialog(response.dialogue_preview)
      }

      return {
        dialogue_preview: response.dialogue_preview,
        vocabulary_highlight: response.vocabulary_highlight,
        grammar_topics: topics.filter((item) => response?.grammar_topics_ids?.includes(item.id)),
        simulation_id: uuidv4(),
      }
    } catch (error: unknown) {
      logger.error(`ConversationService | error in startSimulation: ${error}`)
      throw error
    }
  }
}
