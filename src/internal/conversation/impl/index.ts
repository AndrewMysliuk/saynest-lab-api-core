import fs from "fs"
import { ObjectId } from "mongoose"
import path from "path"
import { v4 as uuidv4 } from "uuid"

import { ConversationStreamEvent, IConversationHistory, IConversationPayload, IConversationResponse, IErrorAnalysisEntity, SessionTypeEnum, StreamEventEnum } from "../../../types"
import { PerfTimer, ensureStorageDirExists, trimConversationHistory } from "../../../utils"
import logger from "../../../utils/logger"
import { ISessionService } from "../../session"
import { ISpeachToText } from "../../speach_to_text"
import { ITextAnalysis } from "../../text_analysis"
import { ITextToSpeach } from "../../text_to_speach"
import { IConversationService } from "../index"
import { IRepository } from "../storage"

const MAX_CONVERSATION_TOKENS = 128000
const SENTENCE_END_REGEX = /[.!?…]/
const MIN_CHARACTERS = 50

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
      const perf = new PerfTimer()
      perf.mark("total")

      const { whisper, gpt_model, tts, system } = payload
      const pair_id = uuidv4()

      const sessionDir = await ensureStorageDirExists(system.session_id)

      const whisperPromise = this.speachToTextService.whisperSpeechToText(whisper.audio_file, whisper?.prompt, sessionDir)
      const sessionDataPromise = this.getSessionData(system.prompt_id, system.session_id, system.global_prompt, sessionDir)

      const [whisperResult, sessionData] = await Promise.all([whisperPromise, sessionDataPromise])

      const { transcription, user_audio_path } = whisperResult
      const { session_id: activeSessionId, conversation_history: initialHistory } = sessionData
      const conversationHistory = [...initialHistory]

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

      conversationHistory.push(userMessage)

      const trimmedHistory = trimConversationHistory(conversationHistory, MAX_CONVERSATION_TOKENS, pair_id)

      const output: { filePath?: string } = {}
      let replyText = ""

      const gptStream = this.textAnalysisService.streamGptReplyOnly({
        ...gpt_model,
        messages: trimmedHistory,
      })

      let sentenceBuffer: string[] = []

      for await (const chunk of gptStream) {
        replyText += chunk
        sentenceBuffer.push(chunk)

        yield {
          type: StreamEventEnum.GPT_RESPONSE,
          role: "assistant",
          content: chunk,
        }

        const combined = sentenceBuffer.join("")
        if (combined.length > MIN_CHARACTERS && SENTENCE_END_REGEX.test(chunk)) {
          const sentence = combined.trim()
          sentenceBuffer.length = 0

          // this.textToSpeachService.ttsTextToSpeechStreamElevenLabs
          const ttsGen = this.textToSpeachService.ttsTextToSpeechStream(
            {
              ...tts,
              input: sentence,
            },
            sessionDir,
            output,
          )

          for await (const audioChunk of ttsGen) {
            yield {
              type: StreamEventEnum.TTS_CHUNK,
              role: "assistant",
              audioChunk,
            }
          }
        }
      }

      if (sentenceBuffer.length > 0) {
        const finalSentence = sentenceBuffer.join("").trim()
        if (finalSentence.length > 0) {
          // this.textToSpeachService.ttsTextToSpeechStreamElevenLabs
          const ttsGen = this.textToSpeachService.ttsTextToSpeechStream(
            {
              ...tts,
              input: finalSentence,
            },
            sessionDir,
            output,
          )

          for await (const audioChunk of ttsGen) {
            yield {
              type: StreamEventEnum.TTS_CHUNK,
              role: "assistant",
              audioChunk,
            }
          }
        }
      }

      const audioFilePath = output.filePath as string

      const modelMessage = {
        session_id: activeSessionId,
        pair_id,
        role: "assistant",
        content: replyText,
        audio_url: `/user_sessions/${activeSessionId}/${path.basename(audioFilePath)}`,
      } as IConversationHistory

      this.historyRepo.saveMany([userMessage, modelMessage]).catch((error) => logger.warn("Failed to save history", error))

      conversationHistory.push(modelMessage)

      const final: IConversationResponse = {
        session_id: activeSessionId.toString(),
        conversation_history: conversationHistory,
        last_model_response: replyText,
      }

      if (outputConversation) outputConversation.finalData = final

      perf.duration("total")
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
    prompt_id: string,
    system_prompt: string,
    session_dir: string,
  ): Promise<{
    session_id: ObjectId
    conversation_history: IConversationHistory[]
  }> {
    const session = await this.sessionService.createSession(prompt_id, system_prompt, session_dir, SessionTypeEnum.SPEACKING)

    const pair_id = uuidv4()
    const session_id = session._id

    const conversation_history = await this.historyRepo.saveHistory({
      session_id,
      pair_id,
      role: "system",
      content: system_prompt,
    })

    return {
      session_id,
      conversation_history: [conversation_history],
    }
  }

  async getSessionData(
    // organization_id: string,
    // user_id: string,
    prompt_id: string,
    session_id: string | undefined,
    system_prompt: string,
    session_dir: string,
  ): Promise<{
    session_id: ObjectId
    conversation_history: IConversationHistory[]
  }> {
    if (session_id) {
      const session = await this.sessionService.getSession(session_id)
      const conversation_history = await this.historyRepo.getHistoryBySession(session_id)

      return { session_id: session._id, conversation_history }
    }

    return this.startNewSession(prompt_id, system_prompt, session_dir)
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
