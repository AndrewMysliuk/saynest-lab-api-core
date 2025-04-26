import { v4 as uuidv4 } from "uuid"

import { ITaskGenerator } from ".."
import { openaiREST } from "../../../config"
import { GPTRoleType, IGenericTask, ITaskGeneratorRequest, TaskTypeEnum } from "../../../types"
import logger from "../../../utils/logger"
import { IPromptService } from "../../prompts_library"
import { ISessionService } from "../../session"
import { TaskTypeMap, getTaskDefinition } from "./helpers"
import { buildSystemPrompt } from "./prompt"

export class TaskGeneratorService implements ITaskGenerator {
  private readonly sessionService: ISessionService
  private readonly promptService: IPromptService

  constructor(sessionService: ISessionService, promptService: IPromptService) {
    this.sessionService = sessionService
    this.promptService = promptService
  }

  async generateTask<T extends TaskTypeEnum>(request: ITaskGeneratorRequest & { type: T }): Promise<IGenericTask<TaskTypeMap[T]["response_type"]>> {
    try {
      const session = await this.sessionService.getSession(request.session_id)
      const prompt = this.promptService.getById(session.prompt_id)

      if (!prompt) {
        throw new Error("Prompt not found.")
      }

      const systemPrompt = buildSystemPrompt(request, prompt)
      const userPrompt = "Start Task Generation"

      const messages: Array<{ role: GPTRoleType; content: string }> = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ]

      const { schema, parseResponse } = getTaskDefinition(request.type)

      const response = await openaiREST.chat.completions.create({
        model: "gpt-4o",
        messages,
        temperature: 0.6,
        max_tokens: 800,
        tools: [
          {
            type: "function",
            function: {
              name: "structured_response_tool",
              description: "Process user conversation and provide structured JSON response.",
              parameters: schema,
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
      const formattedData = parseResponse(rawParsed)

      return {
        id: uuidv4(),
        type: request.type,
        mode: request.mode,
        topic_title: request.topic_title,
        target_language: request.target_language,
        explanation_language: request.explanation_language,
        task: formattedData,
      }
    } catch (error: unknown) {
      logger.error(`generateTask | error: ${error}`)
      throw error
    }
  }
}
