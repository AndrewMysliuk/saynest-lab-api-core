import { ITextAnalysis } from ".."
import { openaiREST } from "../../../config"
import { IGPTPayload } from "../../../types"
import { createScopedLogger } from "../../../utils"
import { IPromptService } from "../../prompts_library"
import { buildSystemPrompt } from "./prompt"

const log = createScopedLogger("textAnalysisService")

export class TextAnalysisService implements ITextAnalysis {
  private readonly promptService: IPromptService

  constructor(promptService: IPromptService) {
    this.promptService = promptService
  }

  async *streamGptReplyOnly(payload: IGPTPayload, prompt_id: string): AsyncGenerator<string, void, unknown> {
    const method = "streamGptReplyOnly"

    try {
      const messages = payload.messages ?? []

      if (!messages.length) {
        const errorMsg = "No messages provided in payload"
        log.error(method, errorMsg)
        throw new Error(errorMsg)
      }

      if (messages[0].role !== "system") {
        const errorMsg = "First message must be a system prompt"
        log.error(method, errorMsg)
        throw new Error(errorMsg)
      }

      const userMessages = messages.filter((item) => item.role === "user")
      if (!userMessages.length) {
        const errorMsg = "No user messages provided"
        log.error(method, errorMsg)
        throw new Error(errorMsg)
      }

      const prompt = this.promptService.getById(prompt_id)
      if (!prompt) {
        const errorMsg = `Prompt with id "${prompt_id}" not found`
        log.error(method, errorMsg)
        throw new Error(errorMsg)
      }

      messages[0].content = buildSystemPrompt(prompt)

      log.info(method, "Starting GPT stream", {
        prompt_id,
        messagesLength: messages.length,
        model: payload.model,
        temperature: payload.temperature,
        max_tokens: payload.max_tokens,
      })

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

      log.info(method, "GPT stream completed", {
        totalTokens: fullText.length,
      })
    } catch (error) {
      log.error("streamGptReplyOnly", "Error during GPT streaming", { error })
      throw error
    }
  }
}
