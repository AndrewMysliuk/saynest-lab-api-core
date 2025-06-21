import { Types } from "mongoose"

import { VocabularyFrequencyLevelEnum } from "./IVocabulary"

export interface IPromptScenarioEntity {
  _id: Types.ObjectId
  organization_id: Types.ObjectId
  user_id: Types.ObjectId
  name: string
  title: string
  description: string
  level: VocabularyFrequencyLevelEnum
  user_content: IUserContent
  model_behavior: IModelBehavior
  meta: IPromptMeta
  is_module_only: boolean
  created_at: Date
  updated_at: Date
}

export interface IUserContent {
  goals: IPromptGoal[]
  dictionary: IDictionaryEntry[]
  phrases: IPhraseEntry[]
}

export interface IPromptGoal {
  phrase: string
  translation: Record<string, string>
}

export interface IDictionaryEntry {
  word: string
  translation: Record<string, string>
  meaning: string
}

export interface IPhraseEntry {
  phrase: string
  translation: Record<string, string>
  meaning: string
}

export interface IModelBehavior {
  prompt: string
  scenario: IScenarioDetails
}

export interface IScenarioDetails {
  setting: string
  situation: string
  goal: string
  steps: string[]
  optional_steps: string[]
}

export interface IPromptQuestionCountRange {
  min: number
  max: number
}

export interface IPromptMeta {
  estimated_duration_minutes: number
  max_turns: number
  model_end_behavior: string
  target_language: string
  question_count_range: IPromptQuestionCountRange | null
}

export interface IPromptFilters {
  search?: string
  title?: string
  is_module_only?: boolean
  user_id?: string
  organization_id?: string
  target_language?: string
}

// Modules
export enum ModuleTypeEnum {
  STRUCTURED = "STRUCTURED",
  FLAT = "FLAT",
}

export interface IModuleSubmodules {
  id: string
  title: string
  description: string
  tips: string[]
  tags?: string[]
  difficulty?: string
  scenarios: string[]
}

export interface IModuleScenarioEntity {
  _id: Types.ObjectId
  organization_id: Types.ObjectId
  user_id: Types.ObjectId
  name: string
  title: string
  description: string
  level: VocabularyFrequencyLevelEnum[]
  tags: string[]
  type: ModuleTypeEnum
  scenarios: string[]
  submodules: IModuleSubmodules[]
  created_at: Date
  updated_at: Date
}

export interface IModuleFilters {
  search?: string
  title?: string
  user_id?: string
  organization_id?: string
  target_language?: string
  tag?: string
}
