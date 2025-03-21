import { v4 as uuidv4 } from "uuid"
import path from "path"
import fs from "fs"
import logger from "../../../utils/logger"
import { IConversationPayload, IConversationHistory, IConversationResponse } from "../../../types"
import { trimConversationHistory } from "../../../utils"
import { ISpeachToText } from "../../speach_to_text"
import { ITextAnalysis } from "../../text_analysis"
import { ITextToSpeach } from "../../text_to_speach"
import { IRepository } from "../storage"
import { IConversationService } from "../index"

const MAX_CONVERSATION_TOKENS = 128000

export class ConversationService implements IConversationService {
  private readonly historyRepo: IRepository
  private readonly speachToTextService: ISpeachToText
  private readonly textAnalysisService: ITextAnalysis
  private readonly textToSpeachService: ITextToSpeach

  constructor(
    historyRepo: IRepository,
    speachToTextService: ISpeachToText,
    textAnalysisService: ITextAnalysis,
    textToSpeachService: ITextToSpeach
  ) {
    this.historyRepo = historyRepo
    this.speachToTextService = speachToTextService
    this.textAnalysisService = textAnalysisService
    this.textToSpeachService = textToSpeachService
  }

  async processConversation(
    { whisper, gpt_model, tts, system }: IConversationPayload,
    onData: (role: string, content: string, audioUrl?: string, audioChunk?: Buffer) => void
  ): Promise<IConversationResponse> {
    try {
      const sessionData = await this.getSessionData(system.sessionId, system.globalPrompt)
      const { session_id: activeSessionId, sessionDir, conversationHistory: initialHistory } = sessionData

      const historyArray = Array.isArray(initialHistory) ? initialHistory : [initialHistory]
      const conversationHistory = [...historyArray]

      const { transcription, user_audio_path } = await this.speachToTextService.whisperSpeechToText(
        whisper.audioFile,
        whisper?.prompt,
        sessionDir
      )

      onData("user", transcription, `/user_sessions/${activeSessionId}/${path.basename(user_audio_path)}`)

      const pairId = uuidv4()

      const savedUserData = await this.historyRepo.saveHistory({
        sessionId: activeSessionId,
        pairId,
        role: "user",
        content: transcription,
        audioUrl: `/user_sessions/${activeSessionId}/${path.basename(user_audio_path)}`,
      })
      conversationHistory.push(savedUserData)

      const trimmedHistory = await trimConversationHistory(conversationHistory, MAX_CONVERSATION_TOKENS, pairId)

      const gptResponse = await this.textAnalysisService.gptConversation({
        ...gpt_model,
        messages: trimmedHistory,
      })

      const toolCalls = gptResponse.choices[0]?.message?.tool_calls?.[0]?.function?.arguments
      if (!toolCalls) {
        throw new Error("gptConversation | No tool_calls found in response.")
      }

      const parsedArguments = JSON.parse(toolCalls)

      onData("assistant", toolCalls)

      const audioFilePath = await this.textToSpeachService.ttsTextToSpeech(
        { ...tts, input: parsedArguments?.message },
        (audioChunk) => {
          onData("assistant", "", "", audioChunk)
        },
        sessionDir
      )

      const savedAssistantData = await this.historyRepo.saveHistory({
        sessionId: activeSessionId,
        pairId,
        role: "assistant",
        content: toolCalls,
        audioUrl: `/user_sessions/${activeSessionId}/${path.basename(audioFilePath)}`,
      })
      conversationHistory.push(savedAssistantData)

      return {
        session_id: activeSessionId,
        conversation_history: conversationHistory,
      }
    } catch (error: unknown) {
      logger.error(`conversationService | error in processConversation: ${error}`)
      throw error
    }
  }

  async startNewSession(
    system_prompt: string
  ): Promise<{ session_id: string; sessionDir: string; conversationHistory: IConversationHistory[] }> {
    const session_id = uuidv4()
    const sessionDir = path.join(__dirname, "../../../../user_sessions", session_id)
    fs.mkdirSync(sessionDir, { recursive: true })

    const pairId = uuidv4()
    const conversationHistory = await this.historyRepo.saveHistory({
      sessionId: session_id,
      pairId,
      role: "system",
      content: system_prompt,
    })

    return { session_id, sessionDir, conversationHistory: [conversationHistory] }
  }

  async getSessionData(
    session_id: string | undefined,
    system_prompt: string
  ): Promise<{ session_id: string; sessionDir: string; conversationHistory: IConversationHistory[] }> {
    if (session_id) {
      const sessionDir = path.join(__dirname, "../../../../user_sessions", session_id)
      if (fs.existsSync(sessionDir)) {
        const conversationHistory = await this.historyRepo.getHistoryBySession(session_id)
        return { session_id, sessionDir, conversationHistory }
      }
    }

    return this.startNewSession(system_prompt)
  }
}
