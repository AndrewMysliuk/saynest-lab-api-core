import fs from "fs"
import path from "path"
import logger from "../utils/logger"
import { IConversationPayload } from "../types"
import { getSessionData, trimConversationHistory } from "../utils"
import { whisperSpeechToText } from "./whisperService"
import { gptConversation } from "./gptService"
import { ttsTextToSpeech } from "./textToSpeachService"

export const processConversation = async ({ whisper, gpt_model, tts, system }: IConversationPayload) => {
  try {
    const { session_id: activeSessionId, sessionDir, conversationHistory } = getSessionData(system.sessionId, system.globalPrompt)
    const { transcription, user_audio_path } = await whisperSpeechToText(whisper.audioFile, whisper?.prompt, sessionDir)

    conversationHistory.push({
      role: "user",
      content: transcription,
      audioUrl: `/user_sessions/${activeSessionId}/${path.basename(user_audio_path)}`,
    })

    const trimmedHistory = trimConversationHistory(conversationHistory, gpt_model.max_tokens || 4096)

    const gptResponse = await gptConversation({
      ...gpt_model,
      messages: trimmedHistory,
    })

    const gptText = gptResponse.choices[0]?.message?.content
    if (!gptText) {
      throw new Error("GPT response did not contain content")
    }

    const audioFilePath = await ttsTextToSpeech({ ...tts, input: gptText }, sessionDir)

    conversationHistory.push({
      role: "assistant",
      content: gptText,
      audioUrl: `/user_sessions/${activeSessionId}/${path.basename(audioFilePath)}`,
    })

    fs.writeFileSync(path.join(sessionDir, "history.json"), JSON.stringify(conversationHistory, null, 2))

    return {
      session_id: activeSessionId,
      conversation_history: conversationHistory,
    }
  } catch (error: unknown) {
    logger.error(`conversationService | error in processConversation: ${error}`)
    throw error
  }
}
