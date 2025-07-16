import { v4 as uuidv4 } from "uuid"

import { IMongooseOptions, ISessionCreateRequest, ISessionEntity, SessionStatusEnum } from "../../../types"
import { createScopedLogger, generateFinallyPrompt, getSingleUsedIeltsPart } from "../../../utils"
import { IRepository as IHistoryRepository } from "../../conversation/storage"
import { IPromptService } from "../../prompts_library"
import { ISessionService } from "../index"
import { IRepository } from "../storage"

const log = createScopedLogger("SessionService")

export class SessionService implements ISessionService {
  private readonly sessionRepo: IRepository
  private readonly historyRepo: IHistoryRepository
  private readonly promptService: IPromptService

  constructor(sessionRepo: IRepository, historyRepo: IHistoryRepository, promptService: IPromptService) {
    this.sessionRepo = sessionRepo
    this.historyRepo = historyRepo
    this.promptService = promptService
  }

  async createSession(dto: ISessionCreateRequest): Promise<ISessionEntity> {
    try {
      const prompt = await this.promptService.getScenario(dto.prompt_id)

      if (!prompt) {
        throw new Error("Prompt not found.")
      }

      const system_prompt = generateFinallyPrompt(prompt)

      let activeIeltsPart = undefined
      if (prompt.meta.is_it_ielts) {
        activeIeltsPart = getSingleUsedIeltsPart(prompt)
      }

      const session = await this.sessionRepo.createSession({ ...dto, system_prompt, active_ielts_part: activeIeltsPart })

      const pair_id = uuidv4()
      const session_id = session._id
      const user_id = session.user_id
      const organization_id = session.organization_id

      await this.historyRepo.saveHistory({
        user_id,
        organization_id,
        session_id,
        pair_id,
        role: "system",
        content: system_prompt,
      })

      return session
    } catch (error: unknown) {
      log.error("createSession", "error", { error })
      throw error
    }
  }

  async getSession(session_id: string): Promise<ISessionEntity> {
    try {
      if (!session_id) throw new Error("session_id field is required")

      return this.sessionRepo.getSession(session_id)
    } catch (error: unknown) {
      log.error("getSession", "error", { error })
      throw error
    }
  }

  async finishSession(session_id: string, options?: IMongooseOptions): Promise<ISessionEntity> {
    try {
      if (!session_id) throw new Error("session_id field is required")

      return this.sessionRepo.setSessionStatus(session_id, SessionStatusEnum.FINISHED, options)
    } catch (error: unknown) {
      log.error("finishSession", "error", { error })
      throw error
    }
  }

  async deleteSession(session_id: string): Promise<void> {
    try {
      return this.sessionRepo.deleteSession(session_id)
    } catch (error: unknown) {
      log.error("deleteSession", "error", { error })
      throw error
    }
  }

  async getSessionsByUserId(user_id: string, options?: IMongooseOptions): Promise<ISessionEntity[]> {
    try {
      if (!user_id) throw new Error("user_id field is required")

      return this.sessionRepo.getSessionsByUserId(user_id, options)
    } catch (error: unknown) {
      log.error("getSessionsByUserId", "error", { error })
      throw error
    }
  }

  async deleteAllByUserId(user_id: string, options?: IMongooseOptions): Promise<void> {
    try {
      return this.sessionRepo.deleteAllByUserId(user_id, options)
    } catch (error: unknown) {
      log.error("deleteAllByUserId", "error", { error })
      throw error
    }
  }
}
