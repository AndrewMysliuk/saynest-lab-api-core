import { ObjectId } from "mongoose"

import { IConversationHistory } from "./IConversation"
import { IGPTPayload } from "./IGPT"

export enum VocabularyFrequencyLevelEnum {
  A1 = "A1",
  A2 = "A2",
  B1 = "B1",
  B2 = "B2",
  C1 = "C1",
  C2 = "C2",
}

export enum PartOfSpeechEnum {
  noun = "noun", // существительное
  pronoun = "pronoun", // местоимение
  verb = "verb", // глагол
  adjective = "adjective", // прилагательное
  adverb = "adverb", // наречие
  preposition = "preposition", // предлог
  conjunction = "conjunction", // союз
  interjection = "interjection", // междометие
  article = "article", // артикль (в английском)
  numeral = "numeral", // числительное
  particle = "particle", // частица (в некоторых языках, напр. в русском)
  determiner = "determiner", // определяющее слово (например, this, those)
}

export interface IMeaningEntity {
  part_of_speech: PartOfSpeechEnum
  translation: string
  meaning: string
  synonyms: string[]
}

export interface IVocabularyEntity {
  _id: ObjectId
  session_id: ObjectId
  language: string
  translation_language: string
  word: string
  frequency_level: VocabularyFrequencyLevelEnum
  meanings: IMeaningEntity[]
  audio_base64: string | null
  updated_at: Date
  created_at: Date
}

export interface IVocabularyJSONEntity {
  language: string
  translation_language: string
  word: string
  frequency_level: VocabularyFrequencyLevelEnum
  meanings: IMeaningEntity[]
  audio_base64: string | null
}

export interface IVocabularyEntityWrapper {
  entries: IVocabularyJSONEntity[]
}

export interface IVocabularyFillersEntity {
  language: string
  translation_language: string
  word: string
  frequency_level: VocabularyFrequencyLevelEnum
  meanings: IMeaningEntity[]
  repeated_count: number
}

export interface IVocabularyFillersEntityWrapper {
  entries: IVocabularyFillersEntity[]
}

export interface IWordExplanationRequest {
  session_id: string
  language: string
  translation_language: string
  word: string
}

export interface ISearchSynonymsRequest {
  payload: IGPTPayload
  history: IConversationHistory[]
  // session_id: string
  language: string
  translation_language: string
}
