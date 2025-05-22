import { Types } from "mongoose"

import { IUserProgressService } from ".."
import {
  IGenericTaskEntity,
  IMongooseOptions,
  IUserProgressApplyReviewStatsRequest,
  IUserProgressEntity,
  IUserProgressErrorStats,
  IUserProgressFillerWordsUsage,
  IUserProgressTasks,
  IVocabularyFillersEntity,
} from "../../../types"
import { calculateStreak, getTrend, logger } from "../../../utils"
import { ICommunicationReviewService } from "../../communication_review"
import { ISessionService } from "../../session"
import { IRepository } from "../storage"

export class UserProgressService implements IUserProgressService {
  private readonly userProgressRepo: IRepository
  private readonly sessionService: ISessionService
  private readonly communicationReviewService: ICommunicationReviewService

  constructor(userProgressRepo: IRepository, sessionService: ISessionService, communicationReviewService: ICommunicationReviewService) {
    this.userProgressRepo = userProgressRepo
    this.sessionService = sessionService
    this.communicationReviewService = communicationReviewService
  }

  async createIfNotExists(user_id: string, organization_id?: string, options?: IMongooseOptions): Promise<IUserProgressEntity | null> {
    try {
      const result = await this.userProgressRepo.createIfNotExists(new Types.ObjectId(user_id), organization_id ? new Types.ObjectId(organization_id) : undefined, options)

      return result
    } catch (error: unknown) {
      logger.error(`createIfNotExists | error: ${error}`)
      throw error
    }
  }

  async update(data: Partial<IUserProgressEntity>, user_id: string, options?: IMongooseOptions): Promise<IUserProgressEntity> {
    try {
      const result = await this.userProgressRepo.update(data, new Types.ObjectId(user_id), options)
      return result
    } catch (error: unknown) {
      logger.error(`update | error: ${error}`)
      throw error
    }
  }

  async getByUserId(user_id: string, options?: IMongooseOptions): Promise<IUserProgressEntity | null> {
    try {
      const result = await this.userProgressRepo.getByUserId(new Types.ObjectId(user_id), options)
      return result
    } catch (error: unknown) {
      logger.error(`getByUserId | error: ${error}`)
      throw error
    }
  }

  async markUserActivity(user_id: string, options?: IMongooseOptions): Promise<void> {
    try {
      const today = new Date().toISOString().slice(0, 10)

      const progress = await this.userProgressRepo.getByUserId(new Types.ObjectId(user_id), options)
      if (!progress) return

      const log = progress.activity_log || {}

      const cleanedLog: Record<string, true> = {}
      for (const date in log) {
        const diff = Math.floor((new Date(today).getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
        if (diff <= 365) {
          cleanedLog[date] = true
        }
      }

      const alreadyMarked = !!cleanedLog[today]
      if (alreadyMarked) return

      cleanedLog[today] = true

      const streak = calculateStreak(cleanedLog)
      const isNewRecord = streak > progress.longest_day_streak

      await this.userProgressRepo.update(
        {
          activity_log: cleanedLog,
          current_day_streak: streak,
          ...(isNewRecord && { longest_day_streak: streak }),
        },
        new Types.ObjectId(user_id),
        options,
      )
    } catch (error: unknown) {
      logger.error(`markUserActivity | error: ${error}`)
      throw error
    }
  }

  async syncTaskProgress(user_id: string, taskEntity: IGenericTaskEntity, options?: IMongooseOptions): Promise<void> {
    try {
      const progress = await this.userProgressRepo.getByUserId(new Types.ObjectId(user_id), options)
      if (!progress) {
        throw new Error(`User progress not found for user_id: ${user_id}`)
      }

      const tasks = [...(progress.tasks || [])]

      const existingIndex = tasks.findIndex((t) => t.task_id === taskEntity._id.toString())

      const updatedTask: IUserProgressTasks = {
        task_id: taskEntity._id.toString(),
        type: taskEntity.type,
        topic_title: taskEntity.topic_title,
        is_completed: taskEntity.is_completed,
        created_at: taskEntity.created_at,
        completed_at: taskEntity.is_completed ? taskEntity.updated_at : new Date("1970-01-01T00:00:00.000Z"),
      }

      if (existingIndex !== -1) {
        tasks[existingIndex] = updatedTask
      } else {
        tasks.push(updatedTask)
      }

      await this.userProgressRepo.update(
        {
          tasks,
        },
        new Types.ObjectId(user_id),
        options,
      )
    } catch (error: unknown) {
      logger.error(`syncTaskProgress | error: ${error}`)
      throw error
    }
  }

  async applyReviewStats(dto: IUserProgressApplyReviewStatsRequest, options?: IMongooseOptions): Promise<void> {
    try {
      const { user_id, session_id } = dto

      const [sessions, reviews] = await Promise.all([this.sessionService.getSessionsByUserId(user_id, options), this.communicationReviewService.reviewsList(user_id)])

      const lastReview = reviews.find((review) => review.session_id.toString() === session_id)

      if (!lastReview) {
        throw new Error(`Review not found for session_id: ${session_id}`)
      }

      const totalSessions = sessions.length
      const durations = reviews.map((r) => r.history?.duration_seconds).filter(Boolean)
      const avgSessionDuration = durations.length ? Math.round(durations.reduce((acc, sec) => acc + sec, 0) / durations.length) : 0

      const progress = await this.userProgressRepo.getByUserId(new Types.ObjectId(user_id), options)

      if (!progress) {
        throw new Error(`User progress not found for user_id: ${user_id}`)
      }

      const cefr_history = [...(progress.cefr_history || [])]

      cefr_history.push({
        date: new Date(),
        level: lastReview.user_cefr_level.level,
      })

      const promptId = lastReview.prompt_id.toString()
      const completed_prompts = { ...(progress.completed_prompts || {}) }
      if (promptId) {
        completed_prompts[promptId] = (completed_prompts[promptId] || 0) + 1
      }

      const filler_words_usage = this.updateFillerStats(lastReview.vocabulary, progress.filler_words_usage)
      const error_stats = this.updateErrorStats(
        lastReview.error_analysis.flatMap((analysis) => analysis.issues.flatMap((issue) => issue.topic_titles)),
        progress.error_stats,
      )

      await this.userProgressRepo.update(
        {
          total_sessions: totalSessions,
          avg_session_duration: avgSessionDuration,
          cefr_history,
          completed_prompts,
          filler_words_usage,
          error_stats,
        },
        new Types.ObjectId(user_id),
        options,
      )
    } catch (error: unknown) {
      logger.error(`applyReviewStats | error: ${error}`)
      throw error
    }
  }

  private updateFillerStats(fillerWordsList: IVocabularyFillersEntity[], fillerWordsUsage: IUserProgressFillerWordsUsage[]): IUserProgressFillerWordsUsage[] {
    try {
      const prevMap = new Map<string, number>()
      for (const word of fillerWordsUsage) {
        prevMap.set(word.word.toLowerCase(), word.total_count)
      }

      const result: IUserProgressFillerWordsUsage[] = fillerWordsList.map((entry) => {
        const word = entry.word.toLowerCase()
        const newCount = entry.repeated_count
        const prevCount = prevMap.get(word)

        const trend = getTrend(prevCount, newCount)

        return {
          word,
          total_count: newCount,
          trend,
        }
      })

      return result.sort((a, b) => b.total_count - a.total_count)
    } catch (error: unknown) {
      logger.error(`updateFillerStats | error: ${error}`)
      throw error
    }
  }

  private updateErrorStats(errorTopicTitles: string[], prevErrorStats: IUserProgressErrorStats[]): IUserProgressErrorStats[] {
    try {
      const prevMap = new Map<string, number>()
      for (const stat of prevErrorStats) {
        prevMap.set(stat.category.toLowerCase(), stat.total_count)
      }

      const newMap = new Map<string, number>()
      for (const topic of errorTopicTitles) {
        const key = topic.toLowerCase()
        newMap.set(key, (newMap.get(key) || 0) + 1)
      }

      const result: IUserProgressErrorStats[] = Array.from(newMap.entries()).map(([category, newCount]) => {
        const prevCount = prevMap.get(category)

        const trend = getTrend(prevCount, newCount)

        return {
          category,
          total_count: newCount,
          trend,
        }
      })

      return result
    } catch (error: unknown) {
      logger.error(`updateErrorStats | error: ${error}`)
      throw error
    }
  }
}
