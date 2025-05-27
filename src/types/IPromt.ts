import { VocabularyFrequencyLevelEnum } from "./IVocabulary"

export interface IPromptScenario {
  id: string
  title: string
  description: string
  level: VocabularyFrequencyLevelEnum
  user_content: IUserContent
  model_behavior: IModelBehavior
  meta: IPromptMeta
  finally_prompt: string
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

export interface IPromptMeta {
  estimated_duration_minutes: number
  max_turns: number
  model_end_behavior: string
  target_language: string
  explanation_language: string
  question_count_range: {
    min: number
    max: number
  } | null
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

export interface IModuleScenario {
  id: string
  title: string
  description: string
  level: VocabularyFrequencyLevelEnum[]
  tags: string[]
  type: ModuleTypeEnum
  scenarios: string[]
  submodules: IModuleSubmodules[]
}
