import { v4 as uuidv4 } from "uuid"
import path from "path"
import logger from "../utils/logger"
import { HistoryRepository } from "../repositories/conversationRepository"
import { IConversationPayload } from "../types"
import { getSessionData, trimConversationHistory } from "../utils"
import { whisperSpeechToText } from "./whisperService"
import { gptConversation } from "./gptService"
import { ttsTextToSpeech } from "./textToSpeachService"

const MAX_CONVERSATION_TOKENS = 128000

const historyRepository = new HistoryRepository()

export const processConversation = async (
  { whisper, gpt_model, tts, system }: IConversationPayload,
  onData: (role: string, content: string, audioUrl?: string, audioChunk?: Buffer) => void
) => {
  try {
    const sessionData = await getSessionData(system.sessionId, system.globalPrompt)
    const { session_id: activeSessionId, sessionDir, conversationHistory } = sessionData

    const { transcription, user_audio_path } = await whisperSpeechToText(whisper.audioFile, whisper?.prompt, sessionDir)

    onData("user", transcription, `/user_sessions/${activeSessionId}/${path.basename(user_audio_path)}`)

    const pairId = uuidv4()

    await historyRepository.saveHistory({
      sessionId: activeSessionId,
      pairId,
      role: "user",
      content: transcription,
      audioUrl: `/user_sessions/${activeSessionId}/${path.basename(user_audio_path)}`,
    })

    const trimmedHistory = await trimConversationHistory(conversationHistory, MAX_CONVERSATION_TOKENS, pairId)

    console.log("trimmedHistory: ", trimmedHistory)

    let gptText = ""
    await gptConversation({ ...gpt_model, messages: trimmedHistory }, (chunk) => {
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

    await historyRepository.saveHistory({
      sessionId: activeSessionId,
      pairId,
      role: "assistant",
      content: gptText,
      audioUrl: `/user_sessions/${activeSessionId}/${path.basename(audioFilePath)}`,
    })

    return {
      session_id: activeSessionId,
      conversation_history: await historyRepository.getHistoryBySession(activeSessionId),
    }
  } catch (error: unknown) {
    logger.error(`conversationService | error in processConversation: ${error}`)
    throw error
  }
}
