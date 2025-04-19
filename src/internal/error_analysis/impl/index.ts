import { IErrorAnalysis } from ".."
import { openaiREST } from "../../../config"
import { GPTRoleType, IErrorAnalysisEntity, IErrorAnalysisModelEntity, IErrorAnalysisRequest } from "../../../types"
import { validateToolResponse } from "../../../utils"
import logger from "../../../utils/logger"
import { ILanguageTheory } from "../../language_theory"
import { IPromptService } from "../../prompts_library"
import { IRepository } from "../storage"
import ConversationErrorAnalyserSchema from "./json_schema/conversation_error_analysis.schema.json"
import { buildSystemPrompt } from "./prompt"

export class ErrorAnalysisService implements IErrorAnalysis {
  private readonly errorAnalysisRepo: IRepository
  private readonly languageTheoryService: ILanguageTheory
  private readonly promptService: IPromptService

  constructor(errorAnalysisRepo: IRepository, languageTheoryService: ILanguageTheory, promptService: IPromptService) {
    this.errorAnalysisRepo = errorAnalysisRepo
    this.languageTheoryService = languageTheoryService
    this.promptService = promptService
  }

  async conversationErrorAnalysis(dto: IErrorAnalysisRequest): Promise<IErrorAnalysisEntity | null> {
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

      const topics = await this.languageTheoryService.filteredShortListByLanguage(dto.target_language, {
        topic_ids: [],
        topic_titles: [],
        level_cefr: [],
      })

      const prompt = this.promptService.getById(dto.prompt_id)

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

      this.errorAnalysisRepo.setErrorAnalysis(dto.session_id, dto.prompt_id, lastUserMessage.content, modelResponse)

      return {
        ...modelResponse,
        session_id: dto.session_id,
        prompt_id: dto.prompt_id,
        last_user_message: lastUserMessage.content,
        created_at: new Date(),
        updated_at: new Date(),
      }
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
