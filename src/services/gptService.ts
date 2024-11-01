import { openaiREST } from "../config"
import logger from "../utils/logger"
import { IGPTPayload } from "../types"

export const gptConversation = async (payload: IGPTPayload) => {
  try {
    const response = await openaiREST.chat.completions.create({
      model: payload.model,
      messages: payload.messages,
      temperature: payload?.temperature || 0.7,
      max_tokens: payload?.max_tokens || 1000,
    })

    return response
  } catch (error: unknown) {
    logger.error("gptService | error in gptConversation: ", error)
    throw error
  }
}
