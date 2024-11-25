import { openaiREST } from "../config"
import logger from "../utils/logger"
import { IGPTPayload } from "../types"

export const gptConversation = async (payload: IGPTPayload): Promise<any> => {
  try {
    const response = await openaiREST.chat.completions.create({
      model: payload.model,
      messages: payload.messages ?? [],
      temperature: payload.temperature || 0.7,
      max_tokens: payload.max_tokens || 1000,
      tools: [
        {
          type: "function",
          function: {
            name: "structured_response_tool",
            description: "Process user conversation and provide structured JSON response.",
            parameters: payload.jsonSchema,
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "structured_response_tool" } },
    })

    return response
  } catch (error: unknown) {
    logger.error(`gptConversation | error: ${error}`)
    throw error
  }
}
