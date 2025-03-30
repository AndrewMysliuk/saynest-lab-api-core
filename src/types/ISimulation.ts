import { ILanguageTopicShort } from "./ILanguageTopic"
import { VocabularyFrequencyLevelEnum } from "./IVocabulary"

export type DialogueRoleType = "AI" | "USER"

export interface ITextBlock {
  role: DialogueRoleType
  text: string
}

export enum ComplexityLevelEnum {
  SIMPLE = "SIMPLE",
  MEDIUM = "MEDIUM",
  ADVANCED = "ADVANCED",
}

export interface IVocabularyEntry {
  word: string
  translation: string
  meaning: string
}

export interface ISimulationDialogue {
  id: string
  original: ITextBlock[] // Диалог на изучаемом языке
  translation: ITextBlock[] // Перевод диалога на родной язык
  audio_url?: string // Аудио ко всей сцене (или заглушка)
  ai_role_name: string // роль, которую играет AI (например, "адвокат", "парикмахер", "врач")
}

export interface IStartSimulationRequest {
  user_id: string
  organization_id: string
  is_audio_needed: boolean
  language: string
  native_language: string
  sentence_count?: number // Сколько предложений в этом диалоге
  complexity_level?: ComplexityLevelEnum // Уровень сложности (по длине/структуре предложений)
  scenario_prompt: string // Описание ситуации (может быть кастомное или из списка)
  level_cefr?: VocabularyFrequencyLevelEnum[]
}

export interface ISimulationStartResponse {
  simulation_id: string
  dialogue_preview: ISimulationDialogue
  grammar_topics: ILanguageTopicShort[]
  vocabulary_highlight: IVocabularyEntry[]
}

export interface ISimulationDialogResponse {
  dialogue_preview: ISimulationDialogue
  grammar_topics_ids: string[]
  vocabulary_highlight: IVocabularyEntry[]
}
