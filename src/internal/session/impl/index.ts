import { ISessionEntity, SessionStatusEnum, SessionTypeEnum } from "../../../types"
import { ISessionService } from "../index"
import { IRepository } from "../storage"

export class SessionService implements ISessionService {
  private readonly sessionRepo: IRepository

  constructor(sessionRepo: IRepository) {
    this.sessionRepo = sessionRepo
  }

  async createSession(organization_id: string, user_id: string, system_prompt: string, type: SessionTypeEnum): Promise<ISessionEntity> {
    return this.sessionRepo.createSession(organization_id, user_id, system_prompt, type)
  }

  async getSession(organization_id: string, user_id: string, session_id: string): Promise<ISessionEntity> {
    if (!session_id || !organization_id || !user_id) throw new Error("session_id, organization_id, user_id fields is required")

    return this.sessionRepo.getSession(organization_id, user_id, session_id)
  }

  async finishSession(organization_id: string, user_id: string, session_id: string): Promise<ISessionEntity> {
    if (!session_id || !organization_id || !user_id) throw new Error("session_id, organization_id, user_id fields is required")

    return this.sessionRepo.setSessionStatus(organization_id, user_id, session_id, SessionStatusEnum.FINISHED)
  }
}
