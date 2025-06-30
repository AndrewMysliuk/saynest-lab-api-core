import { omit } from "lodash"
import { Types } from "mongoose"

import { IVocabulary } from ".."
import { gcsVocabularyBucket, getSignedUrlFromBucket } from "../../../config"
import Languages from "../../../json_data/languages.json"
import { IMongooseOptions, IPagination, IUserWordListFilters, IUserWordLookUpRequest, IUserWordPublic, IUserWordTierEnum } from "../../../types"
import { createScopedLogger, getWordEntryByIndex, normalizeToGlobalWord } from "../../../utils"
import { ITextToSpeach } from "../../text_to_speach"
import { IRepository } from "../storage"

const log = createScopedLogger("VocabularyService")

export class VocabularyService implements IVocabulary {
  private readonly vocabularyRepo: IRepository
  private readonly textToSpeachService: ITextToSpeach

  constructor(vocabularyRepo: IRepository, textToSpeachService: ITextToSpeach) {
    this.vocabularyRepo = vocabularyRepo
    this.textToSpeachService = textToSpeachService
  }

  async lookupWord(dto: IUserWordLookUpRequest, options?: IMongooseOptions): Promise<IUserWordPublic | null> {
    try {
      const normalizedWord = dto.word.trim().toLowerCase()

      let globalWord = await this.vocabularyRepo.findByWordAndLangs(normalizedWord, dto.target_language, dto.native_language, options)

      if (!globalWord) {
        const entry = await getWordEntryByIndex(dto.target_language, normalizedWord)
        if (!entry) return null

        const normalizedEntity = normalizeToGlobalWord(entry, dto.target_language, dto.native_language)

        if (!normalizedEntity.audio_url) {
          const targetLanguage = Languages.find((item) => item.language_iso.toLowerCase() === dto.target_language.toLowerCase())
          const languageCode = targetLanguage?.language_codes[0]

          if (!languageCode) throw new Error("Can't find language code by country")

          const audioPath = await this.textToSpeachService.textToSpeechForDictionaryWords(
            {
              language_code: languageCode,
              response_format: "mp3",
            },
            normalizedWord,
          )

          normalizedEntity.audio_url_request = audioPath
        }

        globalWord = await this.vocabularyRepo.createGlobalWord(normalizedEntity, options)
      }

      if (globalWord.audio_url_request) {
        globalWord.audio_url = await getSignedUrlFromBucket(gcsVocabularyBucket, globalWord.audio_url_request)
      }

      if (dto.user_id) {
        const userWord = await this.vocabularyRepo.findUserWord(dto.user_id, globalWord._id.toString(), options)

        if (userWord) {
          return {
            ...userWord,
            global_word_entity: omit(globalWord, ["__v", "created_at", "updated_at"]),
          }
        }
      }

      return {
        _id: new Types.ObjectId(),
        user_id: null,
        global_word_entity: omit(globalWord, ["__v", "created_at", "updated_at"]),
        tier: null,
        created_at: globalWord.created_at,
        updated_at: globalWord.updated_at,
      }
    } catch (error: unknown) {
      log.error("lookupWord", "error", { error })
      throw error
    }
  }

  async generateWordAudioUrl(global_word_id: string, options?: IMongooseOptions): Promise<string> {
    try {
      const word = await this.vocabularyRepo.findById(global_word_id, options)

      if (!word) {
        throw new Error("word not found")
      }

      if (!word.audio_url && word.audio_url_request) {
        return getSignedUrlFromBucket(gcsVocabularyBucket, word.audio_url_request)
      }

      return ""
    } catch (error: unknown) {
      log.error("generateWordAudioUrl", "error", { error })
      throw error
    }
  }

  async addWordToUser(user_id: string, global_word_id: string, tier: IUserWordTierEnum, options?: IMongooseOptions): Promise<IUserWordPublic> {
    try {
      const existing = await this.vocabularyRepo.findUserWord(user_id, global_word_id, options)

      if (existing) {
        throw new Error("Word already added to user")
      }

      const created = await this.vocabularyRepo.createUserWord(user_id, global_word_id, tier, options)

      return created
    } catch (error: unknown) {
      log.error("addWordToUser", "error", { error })
      throw error
    }
  }

  async updateUserWordTier(user_word_id: string, tier: IUserWordTierEnum, options?: IMongooseOptions): Promise<IUserWordPublic> {
    try {
      const updated = await this.vocabularyRepo.updateTier(user_word_id, tier, options)

      return updated
    } catch (error: unknown) {
      log.error("updateUserWordTier", "error", { error })
      throw error
    }
  }

  async deleteUserWord(user_id: string, global_word_id: string, options?: IMongooseOptions): Promise<void> {
    try {
      await this.vocabularyRepo.deleteUserWord(user_id, global_word_id, options)
    } catch (error: unknown) {
      log.error("deleteUserWord", "error", { error })
      throw error
    }
  }

  async listUserWords(user_id: string, filters: IUserWordListFilters, pagination?: IPagination, options?: IMongooseOptions): Promise<IUserWordPublic[]> {
    try {
      const results = await this.vocabularyRepo.listUserWords(user_id, filters, pagination, options)

      return results
    } catch (error: unknown) {
      log.error("listUserWords", "error", { error })
      throw error
    }
  }
}
