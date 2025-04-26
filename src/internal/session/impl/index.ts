import { v4 as uuidv4 } from "uuid"

import { IMongooseOptions, ISessionEntity, SessionStatusEnum, SessionTypeEnum } from "../../../types"
import { IRepository as IHistoryRepository } from "../../conversation/storage"
import { ISessionService } from "../index"
import { IRepository } from "../storage"

export class SessionService implements ISessionService {
  private readonly sessionRepo: IRepository
  private readonly historyRepo: IHistoryRepository

  constructor(sessionRepo: IRepository, historyRepo: IHistoryRepository) {
    this.sessionRepo = sessionRepo
    this.historyRepo = historyRepo
  }

  async createSession(prompt_id: string, system_prompt: string, session_directory: string, type: SessionTypeEnum): Promise<ISessionEntity> {
    const session = await this.sessionRepo.createSession(prompt_id, system_prompt, session_directory, type)

    const pair_id = uuidv4()
    const session_id = session._id

    await this.historyRepo.saveHistory({
      session_id,
      pair_id,
      role: "system",
      content: system_prompt,
    })

    return session
  }

  async getSession(session_id: string): Promise<ISessionEntity> {
    if (!session_id) throw new Error("session_id field is required")

    return this.sessionRepo.getSession(session_id)
  }

  async finishSession(session_id: string, options?: IMongooseOptions): Promise<ISessionEntity> {
    if (!session_id) throw new Error("session_id field is required")

    return this.sessionRepo.setSessionStatus(session_id, SessionStatusEnum.FINISHED, options)
  }

  async deleteSession(session_id: string): Promise<void> {
    return this.sessionRepo.deleteSession(session_id)
  }
}
