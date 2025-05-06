import { VocabularyFrequencyLevelEnum } from "./IVocabulary"

export interface IPromptScenario {
  id: string
  module: string
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
  translation: string
}

export interface IDictionaryEntry {
  word: string
  translation: string
  meaning: string
}

export interface IPhraseEntry {
  phrase: string
  translation: string
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
}

export interface IPromptMeta {
  estimated_duration_minutes: number
  max_turns: number
  model_end_behavior: string
  target_language: string
  explanation_language: string
}

export interface IModuleScenario {
  id: string
  title: string
  description: string
  level: VocabularyFrequencyLevelEnum[]
  tags: string[]
  scenarios: string[]
}
