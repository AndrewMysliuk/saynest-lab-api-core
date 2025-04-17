import { IErrorAnalysis } from ".."
import { openaiREST } from "../../../config"
import { GPTRoleType, IErrorAnalysisEntity, IErrorAnalysisModelEntity, IErrorAnalysisRequest } from "../../../types"
import { validateToolResponse } from "../../../utils"
import logger from "../../../utils/logger"
import { ILanguageTheory } from "../../language_theory"
import { IRepository } from "../storage"
import ConversationErrorAnalyserSchema from "./json_schema/conversation_error_analysis.schema.json"
import { buildSystemPrompt } from "./prompt"

export class ErrorAnalysisService implements IErrorAnalysis {
  private readonly errorAnalysisRepo: IRepository
  private readonly languageTheoryService: ILanguageTheory

  constructor(errorAnalysisRepo: IRepository, languageTheoryService: ILanguageTheory) {
    this.errorAnalysisRepo = errorAnalysisRepo
    this.languageTheoryService = languageTheoryService
  }

  async conversationErrorAnalysis(dto: IErrorAnalysisRequest): Promise<IErrorAnalysisEntity | null> {
    try {
      const history = dto.gpt_payload.messages ?? []
      const userMessages = history.filter((item) => item.role === "user")
      const lastUserMessage = userMessages[userMessages.length - 1]

      if (history.length === 0) {
        throw new Error("no messages provided in payload.")
      }

      if (userMessages.length === 0) {
        throw new Error("no user messages provided in payload.")
      }

      if (lastUserMessage.content === "") {
        throw new Error("no user content provided in last message.")
      }

      const topics = await this.languageTheoryService.filteredShortListByLanguage(dto.target_language, {
        topic_ids: [],
        topic_titles: [],
        level_cefr: [],
      })

      const systemPrompt = buildSystemPrompt(topics, dto)

      const messages: Array<{ role: GPTRoleType; content: string }> = [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: lastUserMessage.content,
        },
      ]

      const response = await openaiREST.chat.completions.create({
        model: dto.gpt_payload.model || "gpt-4o",
        messages,
        temperature: dto.gpt_payload.temperature || 0.6,
        max_tokens: dto.gpt_payload.max_tokens || 1500,
        tools: [
          {
            type: "function",
            function: {
              name: "structured_response_tool",
              description: "Process user conversation and provide structured JSON response.",
              parameters: ConversationErrorAnalyserSchema,
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
      const modelResponse = validateToolResponse<IErrorAnalysisModelEntity>(rawParsed, ConversationErrorAnalyserSchema)

      return await this.errorAnalysisRepo.setErrorAnalysis(dto.session_id, lastUserMessage.content, modelResponse)
    } catch (error: unknown) {
      logger.error(`conversationErrorAnalysis | error: ${error}`)
      throw error
    }
  }

  async listConversationErrors(session_id: string): Promise<IErrorAnalysisEntity[]> {
    try {
      return this.errorAnalysisRepo.listErrorAnalysisBySession(session_id)
    } catch (error: unknown) {
      logger.error(`getConversationErrors | error: ${error}`)
      throw error
    }
  }
}
