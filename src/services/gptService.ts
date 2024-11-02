import { openaiREST } from "../config"
import logger from "../utils/logger"
import { IGPTPayload } from "../types"

export const gptConversation = async (payload: IGPTPayload, onData: (data: string) => void) => {
  try {
    const responseStream = await openaiREST.chat.completions.create({
      model: payload.model,
      messages: payload.messages,
      temperature: payload.temperature || 0.7,
      max_tokens: payload.max_tokens || 1000,
      stream: true,
    })

    for await (const chunk of responseStream) {
      const [choice] = chunk.choices
      const { content } = choice.delta
      if (content) {
        onData(content)
      }
    }
  } catch (error: unknown) {
    logger.error("gptService | error in gptConversation: ", error)
    throw error
  }
}
