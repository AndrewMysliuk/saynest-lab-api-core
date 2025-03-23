import { ISessionEntity, SessionStatusEnum, SessionTypeEnum } from "../../../types"
import { ISessionService } from "../index"
import { IRepository } from "../storage"

export class SessionService implements ISessionService {
  private readonly sessionRepo: IRepository

  constructor(sessionRepo: IRepository) {
    this.sessionRepo = sessionRepo
  }

  async createSession(system_prompt: string, type: SessionTypeEnum): Promise<ISessionEntity> {
    return this.sessionRepo.createSession(system_prompt, type)
  }

  async getSession(session_id: string): Promise<ISessionEntity> {
    if (!session_id) throw new Error("session_id field is required")

    return this.sessionRepo.getSession(session_id)
  }

  async finishSession(session_id: string): Promise<ISessionEntity> {
    if (!session_id) throw new Error("session_id field is required")

    return this.sessionRepo.setSessionStatus(session_id, SessionStatusEnum.FINISHED)
  }
}
