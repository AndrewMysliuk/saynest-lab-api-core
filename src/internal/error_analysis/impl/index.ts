import { IErrorAnalysis } from ".."
import { openaiREST } from "../../../config"
import { IErrorAnalysisEntity, IErrorAnalysisModelEntity, IGPTPayload } from "../../../types"
import { trimmedMessageHistoryForErrorAnalyser } from "../../../utils"
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

  async conversationErrorAnalysis(session_id: string, payload: IGPTPayload): Promise<IErrorAnalysisEntity | null> {
    try {
      let messages = payload.messages ?? []
      const userMessages = messages.filter((item) => item.role === "user")
      const lastUserMessage = userMessages[userMessages.length - 1]

      if (messages.length === 0) {
        throw new Error("no messages provided in payload.")
      }

      if (messages[0].role !== "system") {
        throw new Error("first message must be a system prompt.")
      }

      if (userMessages.length === 0) {
        throw new Error("no user messages provided in payload.")
      }

      if (lastUserMessage.content === "") {
        throw new Error("no user content provided in last message.")
      }

      const topics = await this.languageTheoryService.filteredShortListByLanguage("en", {
        topic_ids: [],
        topic_titles: [],
        level_cefr: [],
      })

      const systemPrompt = buildSystemPrompt(topics, messages[0].content)

      messages[0].content = systemPrompt
      messages = trimmedMessageHistoryForErrorAnalyser(messages)

      const response = await openaiREST.chat.completions.create({
        model: payload.model,
        messages,
        temperature: payload.temperature || 0.7,
        max_tokens: payload.max_tokens || 1500,
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

      const modelResponse = JSON.parse(toolCall.function.arguments) as IErrorAnalysisModelEntity

      return await this.errorAnalysisRepo.setErrorAnalysis(session_id, lastUserMessage.content, modelResponse)
    } catch (error: unknown) {
      logger.error(`conversationErrorAnalysis | error: ${error}`)
      throw error
    }
  }
}
