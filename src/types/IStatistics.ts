import { Types } from "mongoose"

import { IConversationHistory } from "./IConversation"
import { IErrorAnalysisEntity } from "./IErrorAnalysis"
import { IVocabularyFillersEntity, VocabularyFrequencyLevelEnum } from "./IVocabulary"

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
  quote_from_dialogue?: string
}

export interface IVocabularyUsage {
  word: string
  is_used: boolean
  quote_from_dialogue?: string
}

export interface IExpressionUsage {
  phrase: string
  is_used: boolean
  quote_from_dialogue?: string
}

export interface IStatistics {
  _id: Types.ObjectId
  user_id: Types.ObjectId
  organization_id: Types.ObjectId
  session_id: Types.ObjectId
  prompt_id: string
  topic_title: string
  target_language: string
  explanation_language: string
  history: IStatisticsHistory
  error_analysis: IErrorAnalysisEntity[]
  vocabulary: IVocabularyFillersEntity[]
  suggestion: string[]
  conclusion: string
  user_cefr_level: ILevelDiagnosis
  goals_coverage: IUserGoalEvaluation[]
  vocabulary_used: IVocabularyUsage[]
  phrases_used: IExpressionUsage[]
  updated_at: Date
  created_at: Date
}

export interface IStatisticsModelResponse {
  suggestion: string[]
  conclusion: string
  user_cefr_level: ILevelDiagnosis
  goals_coverage: IUserGoalEvaluation[]
  vocabulary_used: IVocabularyUsage[]
  phrases_used: IExpressionUsage[]
}

export interface IStatisticsGenerateRequest {
  session_id: string
  prompt_id: string
  topic_title: string
  target_language: string
  explanation_language: string
}

export interface IStatisticsUpdateAudioUrl {
  id: string
  user_id: string
  session_id: string
  pair_id: string
  role: string
}
