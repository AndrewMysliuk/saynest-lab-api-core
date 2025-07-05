import { Types } from "mongoose"

import { IUserProgressService } from ".."
import { IGenericTaskEntity, IMongooseOptions, IUserProgressApplyReviewStatsRequest, IUserProgressEntity, IUserProgressErrorStats, IUserProgressTasks } from "../../../types"
import { calculateStreak, createScopedLogger, getTrend } from "../../../utils"
import { ICommunicationReviewService } from "../../communication_review"
import { IPromptService } from "../../prompts_library"
import { ISessionService } from "../../session"
import { IRepository } from "../storage"

const log = createScopedLogger("UserProgressService")

export class UserProgressService implements IUserProgressService {
  private readonly userProgressRepo: IRepository
  private readonly sessionService: ISessionService
  private readonly communicationReviewService: ICommunicationReviewService
  private readonly promptService: IPromptService

  constructor(userProgressRepo: IRepository, sessionService: ISessionService, communicationReviewService: ICommunicationReviewService, promptService: IPromptService) {
    this.userProgressRepo = userProgressRepo
    this.sessionService = sessionService
    this.communicationReviewService = communicationReviewService
    this.promptService = promptService
  }

  async createIfNotExists(user_id: string, organization_id?: string, options?: IMongooseOptions): Promise<IUserProgressEntity | null> {
    try {
      const result = await this.userProgressRepo.createIfNotExists(new Types.ObjectId(user_id), organization_id ? new Types.ObjectId(organization_id) : undefined, options)

      return result
    } catch (error: unknown) {
      log.error("createIfNotExists", "error", {
        error,
      })
      throw error
    }
  }

  async update(data: Partial<IUserProgressEntity>, user_id: string, options?: IMongooseOptions): Promise<IUserProgressEntity> {
    try {
      const result = await this.userProgressRepo.update(data, new Types.ObjectId(user_id), options)
      return result
    } catch (error: unknown) {
      log.error("update", "error", {
        error,
      })
      throw error
    }
  }

  async getByUserId(user_id: string, options?: IMongooseOptions): Promise<IUserProgressEntity | null> {
    try {
      const result = await this.userProgressRepo.getByUserId(new Types.ObjectId(user_id), options)
      return result
    } catch (error: unknown) {
      log.error("getByUserId", "error", {
        error,
      })
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
      log.error("markUserActivity", "error", {
        error,
      })
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
      log.error("syncTaskProgress", "error", {
        error,
      })
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

      const totalSessions = sessions.filter((item) => item.ended_at !== null).length
      const durations = reviews.map((r) => r.history?.duration_seconds).filter(Boolean)
      const avgSessionDuration = durations.length ? Math.round(durations.reduce((acc, sec) => acc + sec, 0) / durations.length) : 0
      const totalSessionDuration = durations.reduce((acc, sec) => acc + sec, 0)

      const [progress, prompt] = await Promise.all([this.userProgressRepo.getByUserId(new Types.ObjectId(user_id), options), this.promptService.getScenario(lastReview.prompt_id.toString())])

      if (!progress) {
        throw new Error(`User progress not found for user_id: ${user_id}`)
      }

      if (!prompt) {
        throw new Error(`Scenario prompt not found for user_id: ${user_id}`)
      }

      const cefr_history = [...(progress.cefr_history || [])]

      if (lastReview.user_cefr_level) {
        cefr_history.push({
          date: new Date(),
          level: lastReview.user_cefr_level.level,
        })
      }

      const completed_prompts = { ...(progress.completed_prompts || {}) }
      completed_prompts[prompt.name] = (completed_prompts[prompt.name] || 0) + 1

      const error_stats = this.updateErrorStats(
        lastReview.error_analysis.flatMap((analysis) => analysis.issues.flatMap((issue) => issue.topic_titles)),
        progress.error_stats,
      )

      await this.userProgressRepo.update(
        {
          total_sessions: totalSessions,
          avg_session_duration: avgSessionDuration,
          total_session_duration: totalSessionDuration,
          cefr_history,
          completed_prompts,
          error_stats,
        },
        new Types.ObjectId(user_id),
        options,
      )
    } catch (error: unknown) {
      log.error("applyReviewStats", "error", {
        error,
      })
      throw error
    }
  }

  private updateErrorStats(errorTopicTitles: string[], prevErrorStats: IUserProgressErrorStats[]): IUserProgressErrorStats[] {
    const prevMap = new Map<string, IUserProgressErrorStats>()
    for (const stat of prevErrorStats) {
      prevMap.set(stat.category.toLowerCase(), { ...stat })
    }

    const newMap = new Map<string, number>()
    for (const topic of errorTopicTitles) {
      const key = topic.toLowerCase()
      newMap.set(key, (newMap.get(key) || 0) + 1)
    }

    for (const [category, newCount] of newMap.entries()) {
      const prevEntry = prevMap.get(category)
      const prevCount = prevEntry ? prevEntry.total_count : 0

      const trend = getTrend(prevCount, newCount)

      prevMap.set(category, {
        category,
        total_count: newCount,
        trend,
      })
    }

    return Array.from(prevMap.values())
  }
}
