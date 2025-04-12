import fs from "fs"
import { ObjectId } from "mongoose"
import path from "path"
import { v4 as uuidv4 } from "uuid"

import { ConversationStreamEvent, IConversationHistory, IConversationPayload, IConversationResponse, IErrorAnalysisEntity, SessionTypeEnum, StreamEventEnum } from "../../../types"
import { trimConversationHistory } from "../../../utils"
import logger from "../../../utils/logger"
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
  private readonly textToSpeachService: ITextToSpeach

  constructor(historyRepo: IRepository, sessionService: ISessionService, speachToTextService: ISpeachToText, textAnalysisService: ITextAnalysis, textToSpeachService: ITextToSpeach) {
    this.historyRepo = historyRepo
    this.sessionService = sessionService
    this.speachToTextService = speachToTextService
    this.textAnalysisService = textAnalysisService
    this.textToSpeachService = textToSpeachService
  }

  async *streamConversation(payload: IConversationPayload, outputConversation?: { finalData?: IConversationResponse }): AsyncGenerator<ConversationStreamEvent> {
    try {
      const { whisper, gpt_model, tts, system } = payload
      const pair_id = uuidv4()

      const sessionData = await this.getSessionData(system.session_id, system.global_prompt)
      const { session_id: activeSessionId, session_directory: sessionDir, conversation_history: initialHistory } = sessionData

      const conversationHistory = [...initialHistory]

      const { transcription, user_audio_path } = await this.speachToTextService.whisperSpeechToText(whisper.audio_file, whisper?.prompt, sessionDir)

      const userMessage = {
        session_id: activeSessionId,
        pair_id,
        role: "user",
        content: transcription,
        audio_url: `/user_sessions/${activeSessionId}/${path.basename(user_audio_path)}`,
      } as IConversationHistory

      yield {
        type: StreamEventEnum.TRANSCRIPTION,
        role: "user",
        content: userMessage.content,
        audio_url: userMessage.audio_url as string,
      }

      // Save user data
      this.historyRepo.saveHistory(userMessage).catch((error) => logger.warn("Failed to save user history", error))

      // Push to history
      conversationHistory.push(userMessage)

      const trimmedHistory = trimConversationHistory(conversationHistory, MAX_CONVERSATION_TOKENS, pair_id)

      const gptResponse = await this.textAnalysisService.gptConversation({
        ...gpt_model,
        messages: trimmedHistory,
      })

      yield {
        type: StreamEventEnum.GPT_RESPONSE,
        role: "assistant",
        content: gptResponse.reply_to_user,
      }

      const output: { filePath?: string } = {}

      const ttsGenerator = this.textToSpeachService.ttsTextToSpeechStream({ ...tts, input: gptResponse.reply_to_user }, sessionDir, output)

      for await (const chunk of ttsGenerator) {
        yield {
          type: StreamEventEnum.TTS_CHUNK,
          role: "assistant",
          audioChunk: chunk,
        }
      }

      const audioFilePath = output.filePath as string

      const modelMessage = {
        session_id: activeSessionId,
        pair_id,
        role: "assistant",
        content: gptResponse.reply_to_user,
        audio_url: `/user_sessions/${activeSessionId}/${path.basename(audioFilePath)}`,
      } as IConversationHistory

      // Save model data
      this.historyRepo.saveHistory(modelMessage).catch((error) => logger.warn("Failed to save model history", error))

      // push to history
      conversationHistory.push(modelMessage)

      const final: IConversationResponse = {
        session_id: activeSessionId.toString(),
        conversation_history: conversationHistory,
        last_model_response: gptResponse,
      }

      if (outputConversation) outputConversation.finalData = final
    } catch (error: unknown) {
      logger.error(`ConversationService | error in processConversation: ${JSON.stringify(error)}`)

      yield {
        type: StreamEventEnum.ERROR,
        role: "system",
        content: "Conversation unexpectedly terminated",
      }

      throw error
    }
  }

  async startNewSession(
    // organization_id: string,
    // user_id: string,
    system_prompt: string,
  ): Promise<{
    session_id: ObjectId
    session_directory: string
    conversation_history: IConversationHistory[]
  }> {
    const session = await this.sessionService.createSession(system_prompt, SessionTypeEnum.SPEACKING)

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
    // organization_id: string,
    // user_id: string,
    session_id: string | undefined,
    system_prompt: string,
  ): Promise<{
    session_id: ObjectId
    session_directory: string
    conversation_history: IConversationHistory[]
  }> {
    if (session_id) {
      const session = await this.sessionService.getSession(session_id)
      const session_directory = session.session_directory

      if (fs.existsSync(session_directory)) {
        const conversation_history = await this.historyRepo.getHistoryBySession(session_id)

        return { session_id: session._id, session_directory, conversation_history }
      }
    }

    return this.startNewSession(system_prompt)
  }

  async listConversationHistory(session_id: string): Promise<IConversationHistory[]> {
    try {
      return this.historyRepo.getHistoryBySession(session_id)
    } catch (error: unknown) {
      logger.error(`ConversationService | error in getConversationHistory: ${JSON.stringify(error)}`)

      throw error
    }
  }
}
