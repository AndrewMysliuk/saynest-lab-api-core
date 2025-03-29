import { ObjectId } from "mongoose"

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
