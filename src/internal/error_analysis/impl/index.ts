import { Types } from "mongoose"

import { IErrorAnalysis } from ".."
import { openaiREST } from "../../../config"
import Languages from "../../../json_data/languages.json"
import { GPTRoleType, IErrorAnalysisEntity, IErrorAnalysisModelEntity, IErrorAnalysisRequest, IMongooseOptions } from "../../../types"
import { createScopedLogger, validateToolResponse } from "../../../utils"
import { ILanguageTheory } from "../../language_theory"
import { IPromptService } from "../../prompts_library"
import { IRepository } from "../storage"
import ConversationErrorAnalyserSchema from "./json_schema/conversation_error_analysis.schema.json"
import { buildSystemPrompt } from "./prompt"

const log = createScopedLogger("ErrorAnalysisService")

export class ErrorAnalysisService implements IErrorAnalysis {
  private readonly errorAnalysisRepo: IRepository
  private readonly languageTheoryService: ILanguageTheory
  private readonly promptService: IPromptService

  constructor(errorAnalysisRepo: IRepository, languageTheoryService: ILanguageTheory, promptService: IPromptService) {
    this.errorAnalysisRepo = errorAnalysisRepo
    this.languageTheoryService = languageTheoryService
    this.promptService = promptService
  }

  async conversationErrorAnalysis(dto: IErrorAnalysisRequest, user_id: string | null, organization_id: string | null): Promise<IErrorAnalysisEntity | null> {
    try {
      const history = dto.gpt_payload.messages ?? []

      if (!history.length) {
        throw new Error("No messages provided in payload.")
      }

      const userMessages = history.filter((item) => item.role === "user")
      const assistantMessages = history.filter((item) => item.role === "assistant")

      if (!userMessages.length) {
        throw new Error("No user messages provided in payload.")
      }

      if (!assistantMessages.length) {
        throw new Error("No assistant messages provided in payload.")
      }

      const lastUserMessage = userMessages[userMessages.length - 1]
      const lastAssistantMessage = assistantMessages[assistantMessages.length - 1]

      const findAlpha2Code = Languages?.find((item) => item.language.toLowerCase() === dto.target_language.toLowerCase())?.language_iso?.toLowerCase()

      if (!findAlpha2Code) {
        throw new Error("Can't find alpha2 code by country")
      }

      const [topics, prompt] = await Promise.all([
        this.languageTheoryService.filteredShortListByLanguage(findAlpha2Code, {
          topic_ids: [],
          topic_titles: [],
          level_cefr: [],
        }),
        this.promptService.getScenario(dto.prompt_id),
      ])

      if (!prompt) {
        throw new Error("Prompt not found.")
      }

      const systemPrompt = buildSystemPrompt(topics, prompt, dto)

      const messages: Array<{ role: GPTRoleType; content: string }> = [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `User Message: "${lastUserMessage.content}" \n Assistant Message: "${lastAssistantMessage.content}"`,
        },
      ]

      const response = await openaiREST.chat.completions.create({
        model: dto.gpt_payload.model || "gpt-4o",
        messages,
        temperature: dto.gpt_payload.temperature || 0.6,
        max_tokens: dto.gpt_payload.max_tokens || 1500,
        // max_completion_tokens: dto.gpt_payload.max_tokens || 1500,
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

      if (!choice) throw new Error("no choices")

      if (choice.finish_reason === "length") {
        throw new Error("OpenAI response was cut off due to max_tokens limit.")
      }

      if (!toolCall || !("function" in toolCall)) {
        throw new Error("no function tool call in response.")
      }

      const rawParsed = JSON.parse(toolCall.function.arguments)
      const modelResponse = validateToolResponse<IErrorAnalysisModelEntity>(rawParsed, ConversationErrorAnalyserSchema)

      const sessionId = new Types.ObjectId(dto.session_id)

      let orgId, userId

      if (user_id && organization_id) {
        orgId = new Types.ObjectId(organization_id)
        userId = new Types.ObjectId(user_id)
      }

      this.errorAnalysisRepo.setErrorAnalysis(dto.session_id, dto.prompt_id, lastUserMessage.content, modelResponse, orgId, userId)

      return {
        ...modelResponse,
        session_id: sessionId,
        organization_id: null,
        user_id: null,
        prompt_id: dto.prompt_id,
        last_user_message: lastUserMessage.content,
        created_at: new Date(),
        updated_at: new Date(),
      }
    } catch (error: unknown) {
      log.error("conversationErrorAnalysis", "error", { error })
      throw error
    }
  }

  async listConversationErrors(session_id: string): Promise<IErrorAnalysisEntity[]> {
    try {
      return this.errorAnalysisRepo.listErrorAnalysisBySession(session_id)
    } catch (error: unknown) {
      log.error("listConversationErrors", "error", { error })
      throw error
    }
  }

  async deleteAllBySessionId(session_id: string): Promise<void> {
    try {
      return this.errorAnalysisRepo.deleteAllBySessionId(session_id)
    } catch (error: unknown) {
      log.error("deleteAllBySessionId", "error", { error })
      throw error
    }
  }

  async deleteAllByUserId(user_id: string, options?: IMongooseOptions): Promise<void> {
    try {
      return this.errorAnalysisRepo.deleteAllByUserId(user_id, options)
    } catch (error: unknown) {
      log.error("deleteAllByUserId", "error", { error })
      throw error
    }
  }
}
