import { v4 as uuidv4 } from "uuid"

import { IMongooseOptions, ISessionCreateRequest, ISessionEntity, SessionStatusEnum, SessionTypeEnum } from "../../../types"
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

  async createSession(dto: ISessionCreateRequest): Promise<ISessionEntity> {
    const session = await this.sessionRepo.createSession(dto)

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
      content: dto.system_prompt,
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

  async getSessionsByUserId(user_id: string, options?: IMongooseOptions): Promise<ISessionEntity[]> {
    if (!user_id) throw new Error("user_id field is required")

    return this.sessionRepo.getSessionsByUserId(user_id, options)
  }
}
