import { ObjectId } from "mongoose"

import { IConversationHistory } from "./IConversation"
import { IErrorAnalysisEntity } from "./IErrorAnalysis"
import { IVocabularyEntity, VocabularyFrequencyLevelEnum } from "./IVocabulary"

export interface IStatisticsHistory {
  start_time: Date // Время начала сессии
  duration_seconds: number // Продолжительность
  user_utterances_count: number // Сколько реплик у пользователя
  model_utterances_count: number // Сколько — у модели
  messages: IConversationHistory[] // Вся история сообщений с аудио
}

export interface IStatistics {
  _id: ObjectId
  session_id: string
  topic_title: string
  language: string
  user_language: string
  history: IStatisticsHistory
  error_analysis: IErrorAnalysisEntity[]
  vocabulary: IVocabularyEntity[]
  suggestion: string
  conclusion: string
  user_cefr_level: VocabularyFrequencyLevelEnum
  updated_at: Date
  created_at: Date
}

export interface IStatisticsGenerateRequest {
  session_id: string
}
