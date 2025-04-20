import { VocabularyFrequencyLevelEnum } from "./IVocabulary"

export interface ILanguageTopic {
  id: string // например: "en_001"
  language: string // язык, который изучается (например: "en")
  cefr_level: VocabularyFrequencyLevelEnum
  title: string // название ТОЛЬКО на изучаемом языке
}
