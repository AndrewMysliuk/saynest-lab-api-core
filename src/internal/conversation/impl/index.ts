import fs from "fs"
import { ObjectId } from "mongoose"
import path from "path"
import { v4 as uuidv4 } from "uuid"

import { IConversationHistory, IConversationPayload, IConversationResponse, SessionTypeEnum } from "../../../types"
import { trimConversationHistory } from "../../../utils"
import logger from "../../../utils/logger"
import { IErrorAnalysis } from "../../error_analysis"
import { ISessionService } from "../../session"
import { ISpeachToText } from "../../speach_to_text"
import { ITextAnalysis } from "../../text_analysis"
import { ITextToSpeach } from "../../text_to_speach"
import { IConversationService } from "../index"
import { IRepository } from "../storage"

const MAX_CONVERSATION_TOKENS = 128000

export class ConversationService implements IConversationService {
  private readonly historyRepo: IRepository
  private readonly sessionService: ISessionService
  private readonly speachToTextService: ISpeachToText
  private readonly textAnalysisService: ITextAnalysis
  private readonly errorAnalysisService: IErrorAnalysis
  private readonly textToSpeachService: ITextToSpeach

  constructor(
    historyRepo: IRepository,
    sessionService: ISessionService,
    speachToTextService: ISpeachToText,
    textAnalysisService: ITextAnalysis,
    errorAnalysisService: IErrorAnalysis,
    textToSpeachService: ITextToSpeach,
  ) {
    this.historyRepo = historyRepo
    this.sessionService = sessionService
    this.speachToTextService = speachToTextService
    this.textAnalysisService = textAnalysisService
    this.errorAnalysisService = errorAnalysisService
    this.textToSpeachService = textToSpeachService
  }

  async processConversation(
    organization_id: string,
    user_id: string,
    { whisper, gpt_model, tts, system }: IConversationPayload,
    onData: (role: string, content: string, audio_url?: string, audio_chunk?: Buffer) => void,
  ): Promise<IConversationResponse> {
    try {
      const sessionData = await this.getSessionData(organization_id, user_id, system.session_id, system.global_prompt)
      const { session_id: activeSessionId, session_directory: sessionDir, conversation_history: initialHistory } = sessionData

      const historyArray = Array.isArray(initialHistory) ? initialHistory : [initialHistory]
      const conversationHistory = [...historyArray]

      const { transcription, user_audio_path } = await this.speachToTextService.whisperSpeechToText(whisper.audio_file, whisper?.prompt, sessionDir)

      onData("user", transcription, `/user_sessions/${activeSessionId}/${path.basename(user_audio_path)}`)

      const pair_id = uuidv4()

      const savedUserData = await this.historyRepo.saveHistory({
        session_id: activeSessionId,
        pair_id,
        role: "user",
        content: transcription,
        audio_url: `/user_sessions/${activeSessionId}/${path.basename(user_audio_path)}`,
      })
      conversationHistory.push(savedUserData)

      const trimmedHistory = await trimConversationHistory(conversationHistory, MAX_CONVERSATION_TOKENS, pair_id)

      const [gptResponse, errorResponse] = await Promise.all([
        this.textAnalysisService.gptConversation({
          ...gpt_model,
          messages: trimmedHistory,
        }),
        this.errorAnalysisService.conversationErrorAnalysis(activeSessionId.toString(), {
          ...gpt_model,
          messages: trimmedHistory,
        }),
      ])

      onData("assistant", gptResponse.reply_to_user)

      const audioFilePath = await this.textToSpeachService.ttsTextToSpeech(
        { ...tts, input: gptResponse.reply_to_user },
        (audio_chunk) => {
          onData("assistant", "", "", audio_chunk)
        },
        sessionDir,
      )

      const savedAssistantData = await this.historyRepo.saveHistory({
        session_id: activeSessionId,
        pair_id,
        role: "assistant",
        content: gptResponse.reply_to_user,
        audio_url: `/user_sessions/${activeSessionId}/${path.basename(audioFilePath)}`,
      })
      conversationHistory.push(savedAssistantData)

      return {
        session_id: activeSessionId.toString(),
        conversation_history: conversationHistory,
        last_model_response: gptResponse,
        error_analyser_response: errorResponse,
      }
    } catch (error: unknown) {
      logger.error(`ConversationService | error in processConversation: ${error}`)
      throw error
    }
  }

  async startNewSession(
    organization_id: string,
    user_id: string,
    system_prompt: string,
  ): Promise<{
    session_id: ObjectId
    session_directory: string
    conversation_history: IConversationHistory[]
  }> {
    const session = await this.sessionService.createSession(organization_id, user_id, system_prompt, SessionTypeEnum.SPEACKING)

    const pair_id = uuidv4()
    const session_id = session._id
    const session_directory = session.session_directory

    const conversation_history = await this.historyRepo.saveHistory({
      session_id,
      pair_id,
      role: "system",
      content: system_prompt,
    })

    return {
      session_id,
      session_directory,
      conversation_history: [conversation_history],
    }
  }

  async getSessionData(
    organization_id: string,
    user_id: string,
    session_id: string | undefined,
    system_prompt: string,
  ): Promise<{
    session_id: ObjectId
    session_directory: string
    conversation_history: IConversationHistory[]
  }> {
    if (session_id) {
      const session = await this.sessionService.getSession(organization_id, user_id, session_id)
      const session_directory = session.session_directory

      if (fs.existsSync(session_directory)) {
        const conversation_history = await this.historyRepo.getHistoryBySession(session_id)

        return { session_id: session._id, session_directory, conversation_history }
      }
    }

    return this.startNewSession(organization_id, user_id, system_prompt)
  }
}
