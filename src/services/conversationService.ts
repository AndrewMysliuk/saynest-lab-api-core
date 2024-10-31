import logger from "../utils/logger"
import { GPTRoleType, IConversationPayload } from "../types"
import { whisperSpeechToText } from "./whisperService"
import { gptConversation } from "./gptService"
import { ttsTextToSpeech } from "./textToSpeachService"

export const processConversation = async ({ whisper, gpt_model, tts }: IConversationPayload) => {
  try {
    const userText = await whisperSpeechToText(whisper.audioFile, whisper?.prompt)

    const message = {
      role: "user",
      content: userText,
    } as { role: GPTRoleType; content: string }

    const gptResponse = await gptConversation({
      ...gpt_model,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        // ...gpt_model.messages,
        message,
      ],
    })

    const gptText = gptResponse.choices[0]?.message?.content
    if (!gptText) {
      throw new Error("GPT response did not contain content")
    }

    const audioFilePath = await ttsTextToSpeech({ ...tts, input: gptText })

    return {
      transcript: gptText,
      audioFilePath,
    }
  } catch (error: unknown) {
    logger.error(`conversationService | error in processConversation: ${error}`)
    throw error
  }
}
