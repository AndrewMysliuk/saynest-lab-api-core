import { Types } from "mongoose"

import { IVocabularyTracker } from ".."
import { openaiREST } from "../../../config"
import { GPTRoleType, ISearchSynonymsRequest, IVocabularyEntity, IVocabularyFillersEntity, IVocabularyFillersEntityWrapper, IVocabularyJSONEntity, IWordExplanationRequest } from "../../../types"
import { logger, validateToolResponse } from "../../../utils"
import { ITextToSpeach } from "../../text_to_speach"
import { IRepository } from "../storage"
import SearchSynonymsSchema from "./json_schema/search_synonyms.schema.json"
import WordExplanationSchema from "./json_schema/word_explanation.schema.json"
import { buildSynonymsSystemPrompt, buildSynonymsUserPrompt, buildVocabularySystemPrompt } from "./prompt"

export class VocabularyTrackerService implements IVocabularyTracker {
  private readonly vocabularyTrackerRepo: IRepository
  private readonly textToSpeachService: ITextToSpeach

  constructor(vocabularyTrackerRepo: IRepository, textToSpeachService: ITextToSpeach) {
    this.vocabularyTrackerRepo = vocabularyTrackerRepo
    this.textToSpeachService = textToSpeachService
  }

  async getWordExplanation(user_id: string, organization_id: string, dto: IWordExplanationRequest): Promise<IVocabularyJSONEntity> {
    try {
      const isSessionIdValid = Types.ObjectId.isValid(dto.session_id)

      const existingWord = await this.vocabularyTrackerRepo.getByWord(dto)

      if (existingWord) {
        logger.info(`Cache hit for word: ${existingWord.word}`)
        return existingWord
      }

      logger.info(`Cache miss — querying GPT for word: ${dto.word}`)

      const messages: Array<{ role: GPTRoleType; content: string }> = [
        {
          role: "system",
          content: buildVocabularySystemPrompt(dto.target_language, dto.explanation_language),
        },
        {
          role: "user",
          content: dto.word,
        },
      ]

      const response = await openaiREST.chat.completions.create({
        model: "gpt-4o",
        messages,
        temperature: 0.6,
        max_tokens: 2000,
        tools: [
          {
            type: "function",
            function: {
              name: "structured_response_tool",
              description: "Process user conversation and provide structured JSON response.",
              parameters: WordExplanationSchema,
            },
          },
        ],
        tool_choice: {
          type: "function",
          function: { name: "structured_response_tool" },
        },
      })

      const toolCall = response.choices?.[0]?.message?.tool_calls?.[0]
      const choice = response.choices?.[0]

      if (choice.finish_reason === "length") {
        throw new Error("OpenAI response was cut off due to max_tokens limit.")
      }

      if (!toolCall?.function?.arguments) {
        throw new Error("No tool response returned by model.")
      }

      const rawParsed = JSON.parse(toolCall.function.arguments)
      const modelResponse = validateToolResponse<IVocabularyJSONEntity>(rawParsed, WordExplanationSchema)

      if (isSessionIdValid) {
        const sessionId = new Types.ObjectId(dto.session_id)
        const orgId = new Types.ObjectId(organization_id)
        const userId = new Types.ObjectId(user_id)

        await this.vocabularyTrackerRepo.create({
          organization_id: orgId,
          user_id: userId,
          ...modelResponse,
          session_id: sessionId,
        })
      }

      return modelResponse
    } catch (error: unknown) {
      logger.error("VocabularyTrackerService | error in getWordExplanation: ", error)
      throw error
    }
  }

  async getWordAudio(dto: IWordExplanationRequest): Promise<string> {
    try {
      const existingWord = await this.vocabularyTrackerRepo.getByWord(dto)

      if (!existingWord) {
        throw new Error("word entity not found")
      }

      if (existingWord.audio_base64) {
        return existingWord.audio_base64
      }

      const response = await this.textToSpeachService.ttsTextToSpeechBase64(
        {
          model: "tts-1",
          voice: "nova",
        },
        dto.word,
      )

      await this.vocabularyTrackerRepo.patchAudio(String(existingWord._id), response)

      return response
    } catch (error: unknown) {
      logger.error("VocabularyTrackerService | error in getWordAudio: ", error)
      throw error
    }
  }

  async wordsList(): Promise<IVocabularyEntity[]> {
    try {
      return this.vocabularyTrackerRepo.list()
    } catch (error: unknown) {
      logger.error("VocabularyTrackerService | error in wordsList:", error)
      throw error
    }
  }

  async wordsListBySessionId(session_id: string): Promise<IVocabularyEntity[]> {
    try {
      const vocabularySessionList = await this.vocabularyTrackerRepo.listBySessionId(session_id)

      if (!vocabularySessionList) return []

      return vocabularySessionList
    } catch (error: unknown) {
      logger.error("wordsListBySessionId | error in wordsList:", error)
      throw error
    }
  }

  async searchFillersByHistory(dto: ISearchSynonymsRequest): Promise<IVocabularyFillersEntity[]> {
    try {
      const userMessagesOnly = dto.history?.filter((msg) => msg.role !== "system" && msg.role !== "assistant")

      if (!Array.isArray(userMessagesOnly)) {
        throw new Error("no messages key provided in payload.")
      }

      if (userMessagesOnly.length === 0) {
        throw new Error("no messages provided in payload.")
      }

      const messages: Array<{ role: GPTRoleType; content: string }> = [
        {
          role: "system",
          content: buildSynonymsSystemPrompt(dto.target_language, dto.explanation_language),
        },
        {
          role: "user",
          content: buildSynonymsUserPrompt(userMessagesOnly, dto.target_language, dto.explanation_language),
        },
      ]

      const response = await openaiREST.chat.completions.create({
        model: dto.payload.model,
        messages,
        temperature: 0.6,
        max_tokens: 3000,
        tools: [
          {
            type: "function",
            function: {
              name: "structured_response_tool",
              description: "Process user conversation and provide structured JSON response.",
              parameters: SearchSynonymsSchema,
            },
          },
        ],
        tool_choice: {
          type: "function",
          function: { name: "structured_response_tool" },
        },
      })

      const toolCall = response.choices?.[0]?.message?.tool_calls?.[0]
      const choice = response.choices?.[0]

      if (choice.finish_reason === "length") {
        throw new Error("OpenAI response was cut off due to max_tokens limit.")
      }

      if (!toolCall?.function?.arguments) {
        throw new Error("No tool response returned by model.")
      }

      const rawParsed = JSON.parse(toolCall.function.arguments)
      const modelResponse = validateToolResponse<IVocabularyFillersEntityWrapper>(rawParsed, SearchSynonymsSchema)

      return modelResponse.entries
    } catch (error: unknown) {
      logger.error("VocabularyTrackerService | error in searchFillersByHistory:", error)
      throw error
    }
  }

  async deleteAllBySessionId(session_id: string): Promise<void> {
    return this.vocabularyTrackerRepo.deleteAllBySessionId(session_id)
  }
}
