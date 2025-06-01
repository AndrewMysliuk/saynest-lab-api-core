import { Types } from "mongoose"

import { TaskTypeEnum } from "./ITaskGenerator"
import { VocabularyFrequencyLevelEnum } from "./IVocabulary"

export enum UserProgressTrendEnum {
  UP = "UP",
  DOWN = "DOWN",
  STABLE = "STABLE",
}

export interface IUserProgressCefrHistory {
  date: Date
  level: VocabularyFrequencyLevelEnum
}

export interface IUserProgressErrorStats {
  category: string
  total_count: number
  trend: UserProgressTrendEnum
}

export interface IUserProgressFillerWordsUsage {
  word: string
  total_count: number
  trend: UserProgressTrendEnum
}

export interface IUserProgressTasks {
  task_id: string
  type: TaskTypeEnum
  topic_title: string
  is_completed: boolean
  created_at: Date
  completed_at: Date
}

export interface IUserProgressEntity {
  _id: Types.ObjectId
  user_id: Types.ObjectId
  organization_id: Types.ObjectId
  total_sessions: number
  avg_session_duration: number
  total_session_duration: number
  cefr_history: IUserProgressCefrHistory[]
  error_stats: IUserProgressErrorStats[]
  filler_words_usage: IUserProgressFillerWordsUsage[]
  completed_prompts: {
    [prompt_id: string]: number // Кол-во раз, когда пользователь прошёл этот prompt
  }
  tasks: IUserProgressTasks[]
  current_day_streak: number
  longest_day_streak: number
  activity_log: Record<string, boolean>
  created_at: Date
  updated_at: Date
}

export interface IUserProgressApplyReviewStatsRequest {
  user_id: string
  session_id: string
}
