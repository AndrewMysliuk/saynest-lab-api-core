import mongoose, { ClientSession, Types } from "mongoose"

import { ICommunicationReviewService } from ".."
import { cleanUserSessionFiles, deleteUserFiles, getSignedUrlFromStoragePath, openaiREST } from "../../../config"
import {
  GPTRoleType,
  ICommunicationReview,
  ICommunicationReviewFilters,
  ICommunicationReviewGenerateRequest,
  ICommunicationReviewModelResponse,
  ICommunicationReviewUpdateAudioUrl,
  IMongooseOptions,
  IPagination,
} from "../../../types"
import { countHistoryData, createScopedLogger, validateToolResponse } from "../../../utils"
import { IConversationService } from "../../conversation"
import { IErrorAnalysis } from "../../error_analysis"
import { IPromptService } from "../../prompts_library"
import { ISessionService } from "../../session"
import { IVocabularyTracker } from "../../vocabulary_tracker"
import { IRepository } from "../storage"
import GenerateStatisticSchema from "./json_schema/generate_statistic.schema.json"
import { buildSystemPrompt, buildUserPrompt } from "./prompt"

const log = createScopedLogger("CommunicationReviewService")

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

  async generateConversationReview(user_id: string, organization_id: string, dto: ICommunicationReviewGenerateRequest): Promise<ICommunicationReview> {
    try {
      const statisticReview = await this.communicationReviewRepo.getBySessionId(dto.session_id)

      const sessionId = new Types.ObjectId(dto.session_id)

      if (statisticReview && statisticReview.session_id === sessionId) {
        return statisticReview
      }

      const historyList = await this.conversationService.listConversationHistory(dto.session_id)

      const [prompt, errorsList, vocabularyList] = await Promise.all([
        this.promptService.getScenario(dto.prompt_id),
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

      if (!prompt) {
        throw new Error("Prompt not found.")
      }

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
      const modelResponse = validateToolResponse<ICommunicationReviewModelResponse>(rawParsed, GenerateStatisticSchema)

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
            consistency_review: modelResponse.consistency_review,
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
      log.error("generateConversationReview", "error", { error })
      throw error
    }
  }

  async reviewsList(user_id: string, filter?: ICommunicationReviewFilters, pagination?: IPagination): Promise<ICommunicationReview[]> {
    try {
      return this.communicationReviewRepo.list(user_id, filter, pagination)
    } catch (error: unknown) {
      log.error("reviewsList", "error", { error })
      throw error
    }
  }

  async deleteReview(review_id: string, user_id: string): Promise<void> {
    try {
      const review = await this.communicationReviewRepo.delete(review_id, user_id)

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
      log.error("deleteReview", "error", { error })
      throw error
    }
  }

  async deleteAllHistoryByUserId(org_id: string, user_id: string, options?: IMongooseOptions): Promise<void> {
    try {
      await Promise.all([
        this.communicationReviewRepo.deleteAllHistoryByUserId(user_id, options),
        this.conversationService.deleteAllByUserId(user_id, options),
        this.errorAnalysisService.deleteAllByUserId(user_id, options),
        this.vocabularyTrackerService.deleteAllByUserId(user_id, options),
        this.sessionService.deleteAllByUserId(user_id, options),
      ])

      await deleteUserFiles(org_id, user_id)
    } catch (error: unknown) {
      log.error("deleteAllHistoryByUserId", "error", { error })
      throw error
    }
  }

  async getReview(id: string, user_id: string): Promise<ICommunicationReview> {
    try {
      const result = await this.communicationReviewRepo.get(id, user_id)

      if (!result) {
        throw new Error(`Review not found with id: ${id}`)
      }

      return result
    } catch (error: unknown) {
      log.error("getReview", "error", { error })
      throw error
    }
  }

  async updateAudioUrl(dto: ICommunicationReviewUpdateAudioUrl): Promise<string> {
    try {
      const [currentReview, historyList] = await Promise.all([this.communicationReviewRepo.get(dto.id, dto.user_id), this.conversationService.listConversationHistory(dto.session_id)])

      if (!currentReview) {
        throw new Error(`Review not found with id: ${dto.id}`)
      }

      const currentHistory = historyList?.find((item) => item.pair_id === dto.pair_id && item.role === dto.role)

      if (!currentHistory) {
        throw new Error(`History not found with pair_id: ${dto.pair_id}`)
      }

      const newUrl = await getSignedUrlFromStoragePath(currentHistory.audio_path)
      currentHistory.audio_url = newUrl

      const newHistoryList = historyList.map((item) => (item.pair_id === dto.pair_id && item.role === dto.role ? currentHistory : item))
      currentReview.history.messages = newHistoryList

      await this.communicationReviewRepo.update(dto.id, dto.user_id, currentReview)

      return newUrl
    } catch (error: unknown) {
      log.error("updateAudioUrl", "error", { error })
      throw error
    }
  }
}
