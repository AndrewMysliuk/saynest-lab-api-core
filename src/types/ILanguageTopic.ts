import { VocabularyFrequencyLevelEnum } from "./IVocabulary"

export interface ITopicContentTextModel {
  type: "TEXT"
  content: string
  content_translation: Record<string, string> // например: { "en": "The verb 'to be'", "uk": "Дієслово 'бути'" }
}

export interface ITopicContentTableModel {
  type: "TABLE"
  headers: string[]
  headers_translation: Record<string, string[]> // например { "en": ["verbs", "alphabet"], "uk": ["дієслова", "абетка"] }
  rows: string[][]
}

export interface ITopicContentExampleModel {
  type: "EXAMPLE"
  content: string
  content_translation: Record<string, string> // например: { "en": "The verb 'to be'", "uk": "Дієслово 'бути'" }
}

export interface ITopicContentAttentionModel {
  type: "ATTENTION"
  content: string
  content_translation: Record<string, string> // например: { "en": "The verb 'to be'", "uk": "Дієслово 'бути'" }
}

type TopicContentBlockType = ITopicContentTextModel | ITopicContentTableModel | ITopicContentExampleModel | ITopicContentAttentionModel

export interface ILanguageTopic {
  id: string // например: "bg_001"
  language: string // язык, который изучается (например: "bg")
  cerf_level: VocabularyFrequencyLevelEnum
  title: string // название ТОЛЬКО на изучаемом языке
  title_translations: Record<string, string> // например: { "en": "The verb 'to be'", "uk": "Дієслово 'бути'" }
  tags: Record<string, string[]> // например { "en": ["verbs", "alphabet"], "uk": ["дієслова", "абетка"] }
  description: Record<string, string> // ключ — язык пользователя: { "en": "...", "uk": "..." }
  explanation: TopicContentBlockType[] // ключ — язык пользователя
}
