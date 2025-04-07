import { IConversationHistory } from "./IConversation"
import { IErrorAnalysisEntity } from "./IErrorAnalysis"
import { IVocabularyJSONEntry, VocabularyFrequencyLevelEnum } from "./IVocabulary"

export interface IStatisticsHistory {
  start_time: Date // Время начала сессии
  duration_seconds: number // Продолжительность
  user_utterances_count: number // Сколько реплик у пользователя
  model_utterances_count: number // Сколько — у модели
  messages: IConversationHistory[] // Вся история сообщений с аудио
}

export interface IStatisticsVocabulary {
  new_words: IVocabularyJSONEntry[]
  repeated_words: IVocabularyJSONEntry[]
}

export interface IStatistics {
  session_id: string
  topic_title: string
  language: string
  user_language: string
  created_at: string
  history: IStatisticsHistory
  error_analysis: IErrorAnalysisEntity[]
  vocabulary: IStatisticsVocabulary
  suggestion: string
  conclusion: string
  user_cefr_level: VocabularyFrequencyLevelEnum
}
