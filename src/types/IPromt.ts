import { VocabularyFrequencyLevelEnum } from "./IVocabulary"

export interface IScenarioDetails {
  allowed_languages: string[]
  force_topic_focus: boolean
  setting: string
  situation: string
  goal: string
  steps: string[]
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

export interface IPromptMeta {
  estimated_duration_minutes: number
  max_turns: number
  end_behavior: string
}

export interface IPromptGoal {
  phrase: string
  translation: string
}

export interface IPromptScenario {
  id: string
  module: string
  title: string
  description: string
  level: VocabularyFrequencyLevelEnum
  scenario: IScenarioDetails
  prompt: string
  dictionary: IDictionaryEntry[]
  phrases: IPhraseEntry[]
  meta: IPromptMeta
  finally_prompt: string
  goals: IPromptGoal[]
}

export interface IModuleScenario {
  id: string
  title: string
  description: string
  level: VocabularyFrequencyLevelEnum[]
  tags: string[]
  scenarios: string[]
}
