import fs from "fs/promises"
import path from "path"
import logger from "../utils/logger"
import { IConversationPayload } from "../types"
import { getSessionData, trimConversationHistory } from "../utils"
import { whisperSpeechToText } from "./whisperService"
import { gptConversation } from "./gptService"
import { ttsTextToSpeech } from "./textToSpeachService"

export const processConversation = async (
  { whisper, gpt_model, tts, system }: IConversationPayload,
  onData: (role: string, content: string, audioUrl?: string, audioChunk?: Buffer) => void
) => {
  try {
    const { session_id: activeSessionId, sessionDir, conversationHistory } = getSessionData(system.sessionId, system.globalPrompt)
    const { transcription, user_audio_path } = await whisperSpeechToText(whisper.audioFile, whisper?.prompt, sessionDir)

    onData("user", transcription, `/user_sessions/${activeSessionId}/${path.basename(user_audio_path)}`)

    conversationHistory.push({
      role: "user",
      content: transcription,
      audioUrl: `/user_sessions/${activeSessionId}/${path.basename(user_audio_path)}`,
    })

    //gpt_model.max_tokens || 128000
    // const trimmedHistory = trimConversationHistory(conversationHistory, gpt_model.max_tokens || 4096)

    let gptText = ""
    await gptConversation({ ...gpt_model, messages: conversationHistory }, (chunk) => {
      gptText += chunk
      onData("assistant", chunk)
    })

    const audioFilePath = await ttsTextToSpeech(
      { ...tts, input: gptText },
      (audioChunk) => {
        onData("assistant", "", "", audioChunk)
      },
      sessionDir
    )

    conversationHistory.push({
      role: "assistant",
      content: gptText,
      audioUrl: `/user_sessions/${activeSessionId}/${path.basename(audioFilePath)}`,
    })

    await fs.writeFile(path.join(sessionDir, "history.json"), JSON.stringify(conversationHistory, null, 2))

    return {
      session_id: activeSessionId,
      conversation_history: conversationHistory,
    }
  } catch (error: unknown) {
    logger.error(`conversationService | error in processConversation: ${error}`)
    throw error
  }
}
