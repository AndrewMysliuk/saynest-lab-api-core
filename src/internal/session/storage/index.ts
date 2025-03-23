import { ISessionEntity, SessionStatusEnum, SessionTypeEnum } from "../../../types"

export interface IRepository {
  createSession(system_prompt: string, type: SessionTypeEnum): Promise<ISessionEntity>
  getSession(session_id: string): Promise<ISessionEntity>
  setSessionStatus(session_id: string, status: SessionStatusEnum): Promise<ISessionEntity>
}
