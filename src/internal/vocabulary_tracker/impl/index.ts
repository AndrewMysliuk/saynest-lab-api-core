import fs from "fs/promises"
import path from "path"

import { IVocabularyTracker } from ".."
import { openaiREST } from "../../../config"
import { GPTRoleType, ISearchSynonymsRequest, IVocabularyJSONEntry, IVocabularyJSONEntryWrapper, IWordExplanationRequest } from "../../../types"
import logger from "../../../utils/logger"
import { ITextToSpeach } from "../../text_to_speach"
import { IRepository } from "../storage"
import SearchSynonymsSchema from "./json_schema/search_synonyms.schema.json"
import WordExplanationSchema from "./json_schema/word_explanation.schema.json"
import { buildSynonymsSystemPrompt, buildVocabularySystemPrompt } from "./prompt"

export class VocabularyTrackerService implements IVocabularyTracker {
  private readonly dataFilePath: string
  private readonly vocabularyTrackerRepo: IRepository
  private readonly textToSpeachService: ITextToSpeach

  constructor(vocabularyTrackerRepo: IRepository, textToSpeachService: ITextToSpeach) {
    this.dataFilePath = path.join(process.cwd(), "user_dictionary", "words.json")
    this.vocabularyTrackerRepo = vocabularyTrackerRepo
    this.textToSpeachService = textToSpeachService
  }

  async getWordExplanation(dto: IWordExplanationRequest): Promise<IVocabularyJSONEntry> {
    try {
      const allEntries = await this.readLocalData()

      const existing = allEntries.find((entry) => entry.word.toLowerCase() === dto.word.toLowerCase() && entry.language === dto.language && entry.translation_language === dto.translation_language)

      if (existing) {
        logger.info(`Cache hit for word: ${dto.word}`)
        return existing
      }

      logger.info(`Cache miss — querying GPT for word: ${dto.word}`)
      const messages: Array<{ role: GPTRoleType; content: string }> = [
        {
          role: "system",
          content: buildVocabularySystemPrompt(dto.language, dto.translation_language),
        },
        {
          role: "user",
          content: dto.word,
        },
      ]

      const response = await openaiREST.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
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

      const parsed = JSON.parse(toolCall.function.arguments) as IVocabularyJSONEntry

      allEntries.push(parsed)
      await this.writeLocalData(allEntries)

      return parsed
    } catch (error: unknown) {
      logger.error("VocabularyTrackerService | error in getWordExplanation: ", error)
      throw error
    }
  }

  async getWordAudio(dto: IWordExplanationRequest): Promise<string> {
    try {
      const allEntries = await this.readLocalData()

      const existingIndex = allEntries.findIndex(
        (entry) => entry.word.toLowerCase() === dto.word.toLowerCase() && entry.language === dto.language && entry.translation_language === dto.translation_language,
      )

      if (existingIndex === -1) {
        throw new Error("word entity not found")
      }

      const existing = allEntries[existingIndex]

      if (existing.audio_base64) {
        return existing.audio_base64
      }

      const response = await this.textToSpeachService.ttsTextToSpeechBase64(
        {
          model: "tts-1",
          voice: "alloy",
        },
        dto.word,
      )

      existing.audio_base64 = response

      allEntries[existingIndex] = existing

      await this.writeLocalData(allEntries)

      return existing.audio_base64
    } catch (error: unknown) {
      logger.error("VocabularyTrackerService | error in getWordAudio: ", error)
      throw error
    }
  }

  async wordsList(): Promise<IVocabularyJSONEntry[]> {
    try {
      const file = await fs.readFile(this.dataFilePath, "utf-8")

      if (!file.trim()) {
        logger.warn("VocabularyTrackerService | JSON file is empty")
        return []
      }

      const data = JSON.parse(file)
      if (!Array.isArray(data)) {
        logger.warn("VocabularyTrackerService | JSON file does not contain an array")
        return []
      }

      return data as IVocabularyJSONEntry[]
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        logger.warn("VocabularyTrackerService | JSON file not found")
        return []
      }

      logger.error("VocabularyTrackerService | error in wordsList:", error)
      throw error
    }
  }

  async searchSynonymsByHistory(dto: ISearchSynonymsRequest): Promise<IVocabularyJSONEntry[]> {
    try {
      const userMessagesOnly = dto.payload.messages?.filter((msg) => msg.role !== "system" && msg.role !== "assistant")

      if (!Array.isArray(userMessagesOnly)) {
        throw new Error("no messages key provided in payload.")
      }

      if (userMessagesOnly.length === 0) {
        throw new Error("no messages provided in payload.")
      }

      const messages: Array<{ role: GPTRoleType; content: string }> = [
        {
          role: "system",
          content: buildSynonymsSystemPrompt(dto.language, dto.translation_language),
        },
        {
          role: "user",
          content: JSON.stringify(userMessagesOnly),
        },
      ]

      const response = await openaiREST.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_tokens: 2000,
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

      const parsed = JSON.parse(toolCall.function.arguments) as IVocabularyJSONEntryWrapper

      let existingEntries = await this.readLocalData()

      const newWords = parsed.entries.filter(
        (item) => !existingEntries.some((entry) => entry.word.toLowerCase() === item.word.toLowerCase() && entry.language === dto.language && entry.translation_language === dto.translation_language),
      )

      const limitedWords = newWords.slice(0, 3)

      if (limitedWords.length > 0) {
        await this.writeLocalData([...existingEntries, ...limitedWords])
      }

      return limitedWords
    } catch (error: unknown) {
      logger.error("VocabularyTrackerService | error in searchSynonymsByHistory:", error)
      throw error
    }
  }

  private async readLocalData(): Promise<IVocabularyJSONEntry[]> {
    try {
      await fs.mkdir(path.dirname(this.dataFilePath), { recursive: true })
      const file = await fs.readFile(this.dataFilePath, "utf-8")

      if (!file.trim()) return []

      const parsed = JSON.parse(file)

      return Array.isArray(parsed) ? parsed : []
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        logger.warn("VocabularyTrackerService | JSON file not found")
        return []
      }

      logger.warn("Error reading local JSON cache: ", error)
      return []
    }
  }

  private async writeLocalData(data: IVocabularyJSONEntry[]): Promise<void> {
    try {
      await fs.writeFile(this.dataFilePath, JSON.stringify(data, null, 2), "utf-8")
    } catch (error: unknown) {
      logger.error("Error writing to JSON file: ", error)
      throw error
    }
  }
}
