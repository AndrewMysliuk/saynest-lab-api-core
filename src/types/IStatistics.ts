import { ObjectId } from "mongoose"

import { IConversationHistory } from "./IConversation"
import { IErrorAnalysisEntity } from "./IErrorAnalysis"
import { IVocabularyEntity, VocabularyFrequencyLevelEnum } from "./IVocabulary"

export interface IStatisticsMetrics {
  lexical_density: number // 0–1: процент лексически значимых слов
  filler_word_count: number // сколько “uh”, “like”, “you know”
  filler_word: string[]
  coherence_score: number // 0–1: насколько логично/связно
  vocabulary_range?: number // уникальные слова / общее число слов
}

export interface IStatisticsHistory {
  start_time: Date // Время начала сессии
  duration_seconds: number // Продолжительность
  user_utterances_count: number // Сколько реплик у пользователя
  model_utterances_count: number // Сколько — у модели
  messages: IConversationHistory[] // Вся история сообщений с аудио
}

export interface ILevelDiagnosis {
  level: VocabularyFrequencyLevelEnum
  reasons: string // например: "used mostly B1-level vocabulary", "few complex sentence structures", "frequent errors with A2 grammar"
}

export interface IUserGoalEvaluation {
  goal: string
  is_covered: boolean
  evidence?: string
}

export interface IVocabularyUsage {
  word: string
  is_used: boolean
  usage_context?: string
}

export interface IExpressionUsage {
  phrase: string
  is_used: boolean
  usage_context?: string
}

export interface IStatistics {
  _id: ObjectId
  prompt_id: string
  session_id: string
  topic_title: string
  language: string
  user_language: string
  history: IStatisticsHistory
  error_analysis: IErrorAnalysisEntity[]
  vocabulary: IVocabularyEntity[]
  metrics: IStatisticsMetrics
  suggestion: string
  conclusion: string
  user_cefr_level: ILevelDiagnosis
  goals_coverage: IUserGoalEvaluation[]
  vocabulary_used: IVocabularyUsage[]
  phrases_used: IExpressionUsage[]
  updated_at: Date
  created_at: Date
}

export interface IStatisticsModelResponse {
  suggestion: string
  conclusion: string
  metrics: IStatisticsMetrics
  user_cefr_level: ILevelDiagnosis
  goals_coverage: IUserGoalEvaluation[]
  vocabulary_used: IVocabularyUsage[]
  phrases_used: IExpressionUsage[]
}

export interface IStatisticsGenerateRequest {
  session_id: string
  prompt_id: string
  topic_title: string
  language: string
  user_language: string
}
