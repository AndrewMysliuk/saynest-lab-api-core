import mongoose, { ClientSession, Types } from "mongoose"

import { ICommunicationReviewService } from ".."
import { cleanUserSessionFiles, openaiREST } from "../../../config"
import { GPTRoleType, IStatistics, IStatisticsGenerateRequest, IStatisticsModelResponse } from "../../../types"
import { countHistoryData, validateToolResponse } from "../../../utils"
import logger from "../../../utils/logger"
import { IConversationService } from "../../conversation"
import { IErrorAnalysis } from "../../error_analysis"
import { IPromptService } from "../../prompts_library"
import { ISessionService } from "../../session"
import { IVocabularyTracker } from "../../vocabulary_tracker"
import { IRepository } from "../storage"
import GenerateStatisticSchema from "./json_schema/generate_statistic.schema.json"
import { buildSystemPrompt, buildUserPrompt } from "./prompt"

export class CommunicationReviewService implements ICommunicationReviewService {
  private readonly communicationReviewRepo: IRepository
  private readonly errorAnalysisService: IErrorAnalysis
  private readonly vocabularyTrackerService: IVocabularyTracker
  private readonly conversationService: IConversationService
  private readonly sessionService: ISessionService
  private readonly promptService: IPromptService

  constructor(
    communicationReviewRepo: IRepository,
    errorAnalysisService: IErrorAnalysis,
    vocabularyTrackerService: IVocabularyTracker,
    conversationService: IConversationService,
    sessionService: ISessionService,
    promptService: IPromptService,
  ) {
    this.communicationReviewRepo = communicationReviewRepo
    this.errorAnalysisService = errorAnalysisService
    this.vocabularyTrackerService = vocabularyTrackerService
    this.conversationService = conversationService
    this.sessionService = sessionService
    this.promptService = promptService
  }

  async generateConversationReview(user_id: string, organization_id: string, dto: IStatisticsGenerateRequest): Promise<IStatistics> {
    try {
      const statisticReview = await this.communicationReviewRepo.getBySessionId(dto.session_id)

      const sessionId = new Types.ObjectId(dto.session_id)

      if (statisticReview && statisticReview.session_id === sessionId) {
        return statisticReview
      }

      const prompt = this.promptService.getById(dto.prompt_id)

      if (!prompt) {
        throw new Error("Prompt not found.")
      }

      const historyList = await this.conversationService.listConversationHistory(dto.session_id)

      const [errorsList, vocabularyList] = await Promise.all([
        this.errorAnalysisService.listConversationErrors(dto.session_id),
        this.vocabularyTrackerService.searchFillersByHistory({
          target_language: dto.target_language,
          explanation_language: dto.explanation_language,
          payload: {
            model: "gpt-4o",
          },
          history: historyList,
        }),
      ])

      const messages: Array<{ role: GPTRoleType; content: string }> = [
        { role: "system", content: buildSystemPrompt(dto.target_language, dto.explanation_language, prompt) },
        { role: "user", content: buildUserPrompt(historyList, errorsList, vocabularyList, dto.target_language, dto.explanation_language) },
      ]

      const response = await openaiREST.chat.completions.create({
        // model: "gpt-4.1",
        model: "gpt-4o",
        messages,
        temperature: 0.6,
        max_tokens: 3000,
        tools: [
          {
            type: "function",
            function: {
              name: "structured_response_tool",
              description: "Process user conversation and provide structured JSON response.",
              parameters: GenerateStatisticSchema,
            },
          },
        ],
        tool_choice: {
          type: "function",
          function: { name: "structured_response_tool" },
        },
      })

      const toolCall = response.choices?.[0]?.message?.tool_calls?.[0]
      const choice = response.choices?.[0]

      if (choice.finish_reason === "length") {
        throw new Error("OpenAI response was cut off due to max_tokens limit.")
      }

      if (!toolCall?.function?.arguments) {
        throw new Error("no tool response returned by model.")
      }

      const rawParsed = JSON.parse(toolCall.function.arguments)
      const modelResponse = validateToolResponse<IStatisticsModelResponse>(rawParsed, GenerateStatisticSchema)

      const historyReview = countHistoryData(historyList)

      // Create DB Transaction
      const session: ClientSession = await mongoose.startSession()
      try {
        session.startTransaction()

        const userId = new Types.ObjectId(user_id)
        const orgId = new Types.ObjectId(organization_id)

        const reviewResponse = await this.communicationReviewRepo.add(
          {
            user_id: userId,
            organization_id: orgId,
            session_id: sessionId,
            prompt_id: dto.prompt_id,
            topic_title: dto.topic_title,
            target_language: dto.target_language,
            explanation_language: dto.explanation_language,
            history: historyReview,
            error_analysis: errorsList,
            vocabulary: vocabularyList,
            suggestion: modelResponse.suggestion,
            conclusion: modelResponse.conclusion,
            user_cefr_level: modelResponse.user_cefr_level,
            goals_coverage: modelResponse.goals_coverage,
            vocabulary_used: modelResponse.vocabulary_used,
            phrases_used: modelResponse.phrases_used,
          },
          {
            session,
          },
        )

        await this.sessionService.finishSession(dto.session_id, { session })
        await session.commitTransaction()

        return reviewResponse
      } catch (error: unknown) {
        await session.abortTransaction()
        throw error
      } finally {
        session.endSession()
      }
    } catch (error: unknown) {
      logger.error(`generateConversationReview | error: ${error}`)
      throw error
    }
  }

  async reviewsList(): Promise<IStatistics[]> {
    try {
      return this.communicationReviewRepo.list()
    } catch (error: unknown) {
      logger.error(`reviewsList | error: ${error}`)
      throw error
    }
  }

  async deleteReview(review_id: string): Promise<void> {
    try {
      const review = await this.communicationReviewRepo.delete(review_id)

      if (!review) return

      await Promise.all([
        this.conversationService.deleteAllBySessionId(review.session_id.toString()),
        this.errorAnalysisService.deleteAllBySessionId(review.session_id.toString()),
        this.vocabularyTrackerService.deleteAllBySessionId(review.session_id.toString()),
        this.sessionService.deleteSession(review.session_id.toString()),
      ])

      await cleanUserSessionFiles([
        {
          _id: review.session_id.toString(),
          organization_id: review.organization_id.toString(),
          user_id: review.user_id.toString(),
        },
      ])
    } catch (error: unknown) {
      logger.error(`deleteReview | error: ${error}`)
      throw error
    }
  }

  async getReview(id: string): Promise<IStatistics> {
    try {
      const result = await this.communicationReviewRepo.get(id)

      if (!result) {
        throw new Error(`Review not found with id: ${id}`)
      }

      return result
    } catch (error: unknown) {
      logger.error(`getReview | error: ${error}`)
      throw error
    }
  }
}
