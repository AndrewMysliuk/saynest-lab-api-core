import { v4 as uuidv4 } from "uuid"

import { ITaskGenerator } from ".."
import { openaiREST } from "../../../config"
import { GPTRoleType, ITaskGeneratorRequest, ITaskGeneratorResponse } from "../../../types"
import logger from "../../../utils/logger"
import { getTaskDefinition } from "./helpers"
import { buildSystemPrompt, buildUserPrompt } from "./prompt"

export class TaskGeneratorService implements ITaskGenerator {
  async generateTask(request: ITaskGeneratorRequest): Promise<ITaskGeneratorResponse> {
    try {
      const systemPrompt = buildSystemPrompt(request)
      const userPrompt = buildUserPrompt(request)
      const messages: Array<{ role: GPTRoleType; content: string }> = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ]

      const { schema, parseResponse } = getTaskDefinition(request.type)

      const response = await openaiREST.chat.completions.create({
        model: request.gpt_payload.model,
        messages,
        temperature: request.gpt_payload.temperature || 0.7,
        max_tokens: request.gpt_payload.max_tokens || 1500,
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

      const data = JSON.parse(toolCall.function.arguments)

      return {
        id: uuidv4(),
        type: request.type,
        language: request.language,
        native_language: request.native_language,
        level_cefr: request.level_cefr,
        topic_ids: request.topic_ids,
        topic_titles: request.topic_ids,
        context: request.context,
        sandbox_prompt: request.sandbox_prompt,
        sentence_count: request.sentence_count,
        mode: request.mode,
        blank_count: request.blank_count,
        metadata: {},
        data: parseResponse(data),
      }
    } catch (error: unknown) {
      logger.error(`generateTask | error: ${error}`)
      throw error
    }
  }
}
