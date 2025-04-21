import { ITextAnalysis } from ".."
import { openaiREST } from "../../../config"
import { IGPTPayload } from "../../../types"
import logger from "../../../utils/logger"
import { IPromptService } from "../../prompts_library"
import { buildSystemPrompt } from "./prompt"

export class TextAnalysisService implements ITextAnalysis {
  private readonly promptService: IPromptService

  constructor(promptService: IPromptService) {
    this.promptService = promptService
  }

  async *streamGptReplyOnly(payload: IGPTPayload, prompt_id: string): AsyncGenerator<string, void, unknown> {
    try {
      const messages = payload.messages ?? []

      if (!messages.length) {
        throw new Error("no messages provided in payload.")
      }

      const userMessages = messages.filter((item) => item.role === "user")

      if (messages[0].role !== "system") {
        throw new Error("first message must be a system prompt.")
      }

      if (!userMessages.length) {
        throw new Error("no user messages provided in payload.")
      }

      const prompt = this.promptService.getById(prompt_id)

      if (!prompt) {
        throw new Error("Prompt not found.")
      }

      messages[0].content = buildSystemPrompt(prompt)

      const stream = await openaiREST.chat.completions.create({
        model: payload.model,
        messages,
        temperature: payload.temperature || 0.6,
        max_tokens: payload.max_tokens || 300,
        stream: true,
      })

      let fullText = ""
      for await (const chunk of stream) {
        const content = chunk?.choices?.[0]?.delta?.content
        if (content) {
          fullText += content
          yield content
        }
      }

      logger.info("streamGptReplyOnly successfully completed")
    } catch (error: unknown) {
      logger.error(`streamGptReplyOnly | error: ${error}`)
      throw error
    }
  }
}
