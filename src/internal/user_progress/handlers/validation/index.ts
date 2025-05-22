import { z } from "zod"

import { TaskTypeEnum, UserProgressTrendEnum, VocabularyFrequencyLevelEnum } from "../../../../types"

const ObjectIdRegex = /^[a-f\d]{24}$/i

const objectIdSchema = z.string().regex(ObjectIdRegex, "Invalid ObjectId")

const cefrHistorySchema = z.object({
  date: z.coerce.date(),
  level: z.nativeEnum(VocabularyFrequencyLevelEnum),
})

const errorStatsSchema = z.object({
  category: z.string(),
  total_count: z.number().nonnegative(),
  trend: z.nativeEnum(UserProgressTrendEnum),
})

const fillerWordsUsageSchema = z.object({
  word: z.string(),
  total_count: z.number().nonnegative(),
  trend: z.nativeEnum(UserProgressTrendEnum),
})

const tasksSchema = z.object({
  task_id: objectIdSchema,
  type: z.nativeEnum(TaskTypeEnum),
  topic_title: z.string(),
  is_completed: z.boolean(),
  created_at: z.coerce.date(),
  completed_at: z.coerce.date(),
})

export const updateUserProgressSchema = z.object({
  total_sessions: z.number().nonnegative().optional(),
  avg_session_duration: z.number().nonnegative().optional(),
  cefr_history: z.array(cefrHistorySchema).optional(),
  error_stats: z.array(errorStatsSchema).optional(),
  filler_words_usage: z.array(fillerWordsUsageSchema).optional(),
  completed_prompts: z.record(z.string(), z.number()).optional(),
  tasks: z.array(tasksSchema).optional(),
  current_day_streak: z.number().nonnegative().optional(),
  longest_day_streak: z.number().nonnegative().optional(),
  activity_log: z.record(z.boolean()).optional(),
})
