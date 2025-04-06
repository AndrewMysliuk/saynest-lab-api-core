import { ObjectId } from "mongoose"

import { IGPTPayload } from "./IGPT"

export enum VocabularyFrequencyLevelEnum {
  A1 = "A1",
  A2 = "A2",
  B1 = "B1",
  B2 = "B2",
  C1 = "C1",
  C2 = "C2",
}

export enum VocabularySourceEnum {
  CLICK = "CLICK",
  REPEATED = "REPEATED",
  THEMATIC = "THEMATIC",
  MANUAL = "MANUAL",
}

export interface IVocabularyEntity {
  _id: ObjectId
  user_id: ObjectId
  session_id: ObjectId
  language: string
  word: string
  translation: string
  meaning: string
  part_of_speech: string
  frequency_level: VocabularyFrequencyLevelEnum
  source: VocabularySourceEnum
  usage_count: number
  first_used_at: Date
  last_used_at: Date
  is_archived: boolean
  //   is_favorite?: boolean
  //   context_message?: string
  //   synonyms?: string[]
  //   examples?: string[]
}

export enum PartOfSpeechEnum {
  noun = "noun",
  verb = "verb",
  adjective = "adjective",
}

export interface IMeaningJSONEntry {
  part_of_speech: PartOfSpeechEnum
  translation: string
  meaning: string
  synonyms: string[]
}

export interface IVocabularyJSONEntry {
  language: string
  translation_language: string
  word: string
  frequency_level: VocabularyFrequencyLevelEnum
  meanings: IMeaningJSONEntry[]
  audio_base64: string | null
}

export interface IVocabularyJSONEntryWrapper {
  entries: IVocabularyJSONEntry[]
}

export interface IWordExplanationRequest {
  language: string
  translation_language: string
  word: string
}

export interface ISearchSynonymsRequest {
  payload: IGPTPayload
  language: string
  translation_language: string
}
