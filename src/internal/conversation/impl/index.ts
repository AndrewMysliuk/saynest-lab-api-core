import { Types } from "mongoose"
import { v4 as uuidv4 } from "uuid"

import { gcsBucket, getSignedUrlFromStoragePath } from "../../../config"
import Languages from "../../../json_data/languages.json"
import { ConversationStreamEvent, IConversationHistory, IConversationPayload, IConversationResponse, IMongooseOptions, StreamEventEnum } from "../../../types"
import { PerfTimer, createScopedLogger, generateFileName, getStorageFilePath, logger, trimConversationHistory } from "../../../utils"
import { ISessionService } from "../../session"
import { ISpeachToText } from "../../speach_to_text"
import { ITextAnalysis } from "../../text_analysis"
import { ITextToSpeach } from "../../text_to_speach"
import { IConversationService } from "../index"
import { IRepository } from "../storage"

const MAX_CONVERSATION_TOKENS = 128000
const SENTENCE_END_REGEX = /[.!?…]/
const MIN_CHARACTERS = 50
const log = createScopedLogger("conversationService")

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

  async *streamConversation(
    payload: IConversationPayload,
    organization_id: string | null,
    user_id: string | null,
    outputConversation?: { finalData?: IConversationResponse },
  ): AsyncGenerator<ConversationStreamEvent> {
    try {
      const perf = new PerfTimer()
      perf.mark("total")

      const { whisper, gpt_model, tts, system } = payload
      const pair_id = uuidv4()
      let orgId, userId

      log.info("streamConversation", "Started streaming", {
        session_id: system.session_id,
        user_id,
        organization_id,
      })

      if (user_id && organization_id) {
        orgId = new Types.ObjectId(organization_id)
        userId = new Types.ObjectId(user_id)
      }

      const sessionDir = getStorageFilePath({
        organization_id,
        user_id,
        session_id: system.session_id,
      })

      const findAlpha2Code = Languages?.find((item) => item.language.toLowerCase() === payload.target_language.toLowerCase())?.language_iso?.toLowerCase()

      if (!findAlpha2Code) {
        throw new Error("Can't find alpha2 code by country")
      }

      const whisperPromise = this.speachToTextService.whisperSpeechToText(whisper.audio_file, whisper?.prompt, findAlpha2Code, sessionDir)
      const sessionDataPromise = this.getSessionData(system.session_id)

      const [whisperResult, sessionData] = await Promise.all([whisperPromise, sessionDataPromise])

      const { transcription, user_audio_path, user_audio_url } = whisperResult
      const { session_id: activeSessionId, finally_prompt: finallyPrompt, conversation_history: initialHistory } = sessionData
      const conversationHistory = [...initialHistory]

      log.info("streamConversation", "Transcription and session loaded", {
        transcription,
        session_id: activeSessionId.toString(),
      })

      const userMessage = {
        organization_id: orgId,
        user_id: userId,
        session_id: activeSessionId,
        pair_id,
        role: "user",
        content: transcription,
        audio_path: user_audio_path,
        audio_url: user_audio_url,
        created_at: new Date(),
      } as IConversationHistory

      yield {
        type: StreamEventEnum.TRANSCRIPTION,
        role: "user",
        content: userMessage.content,
        audio_url: userMessage.audio_url as string,
      }

      conversationHistory.push(userMessage)

      const trimmedHistory = trimConversationHistory(conversationHistory, MAX_CONVERSATION_TOKENS, pair_id)

      let replyText = ""
      const allAudioChunks: Buffer[] = []

      const gptStream = this.textAnalysisService.streamGptReplyOnly(
        {
          ...gpt_model,
          messages: trimmedHistory,
        },
        finallyPrompt,
      )

      let sentenceBuffer: string[] = []

      log.info("streamConversation", "Started GPT stream")

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
            undefined,
            undefined,
            false,
          )

          for await (const audioChunk of ttsGen) {
            allAudioChunks.push(audioChunk)
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
            undefined,
            undefined,
            false,
          )

          for await (const audioChunk of ttsGen) {
            allAudioChunks.push(audioChunk)
            yield {
              type: StreamEventEnum.TTS_CHUNK,
              role: "assistant",
              audioChunk,
            }
          }
        }
      }

      const fileExtension = tts?.response_format || "mp3"
      const filename = generateFileName("model-response", fileExtension)
      const storagePath = `${sessionDir}/${filename}`
      const gcsFile = gcsBucket.file(storagePath)

      await gcsFile.save(Buffer.concat(allAudioChunks), {
        metadata: {
          contentType: `audio/${fileExtension}`,
        },
      })

      yield {
        type: StreamEventEnum.GPT_FULL_RESPONSE,
        role: "assistant",
        content: replyText,
      }

      log.info("streamConversation", "Finished GPT stream", {
        response_length: replyText.length,
      })

      const modelMessage = {
        organization_id: orgId,
        user_id: userId,
        session_id: activeSessionId,
        pair_id,
        role: "assistant",
        content: replyText,
        audio_path: storagePath,
        audio_url: await getSignedUrlFromStoragePath(storagePath),
        created_at: new Date(),
      } as IConversationHistory

      this.historyRepo.saveMany([userMessage, modelMessage]).catch((error) => logger.warn("Failed to save history", error))

      log.info("streamConversation", "Saved user and model messages to history")

      conversationHistory.push(modelMessage)

      const final: IConversationResponse = {
        session_id: activeSessionId.toString(),
        conversation_history: conversationHistory,
        last_model_response: replyText,
      }

      if (outputConversation) outputConversation.finalData = final

      perf.duration("total")
    } catch (error: unknown) {
      log.error("streamConversation", "Error during conversation", {
        error: error instanceof Error ? error.message : String(error),
      })

      yield {
        type: StreamEventEnum.ERROR,
        role: "system",
        content: "Conversation unexpectedly terminated",
      }

      throw error
    }
  }

  async getSessionData(session_id: string): Promise<{
    session_id: Types.ObjectId
    finally_prompt: string
    conversation_history: IConversationHistory[]
  }> {
    const session = await this.sessionService.getSession(session_id)

    log.info("getSessionData", "Loaded session data", { session_id })

    const conversation_history = await this.historyRepo.getHistoryBySession(session_id)

    log.info("getSessionData", "Fetched history", { session_id })

    return { session_id: session._id, finally_prompt: session.system_prompt, conversation_history }
  }

  async listConversationHistory(session_id: string): Promise<IConversationHistory[]> {
    try {
      return this.historyRepo.getHistoryBySession(session_id)
    } catch (error: unknown) {
      log.error("listConversationHistory", "Failed to fetch history", {
        error: error instanceof Error ? error.message : String(error),
      })

      throw error
    }
  }

  async deleteAllBySessionId(session_id: string): Promise<void> {
    try {
      return this.historyRepo.deleteAllBySessionId(session_id)
    } catch (error: unknown) {
      log.info("deleteAllBySessionId", `${error}`)
      throw error
    }
  }

  async deleteAllByUserId(user_id: string, options?: IMongooseOptions): Promise<void> {
    try {
      return this.historyRepo.deleteAllByUserId(user_id, options)
    } catch (error: unknown) {
      log.info("deleteAllByUserId", `${error}`)
      throw error
    }
  }
}
