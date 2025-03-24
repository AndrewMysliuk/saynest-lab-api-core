import { ISessionEntity, SessionStatusEnum, SessionTypeEnum } from "../../../types"

export interface IRepository {
  createSession(organization_id: string, user_id: string, system_prompt: string, type: SessionTypeEnum): Promise<ISessionEntity>
  getSession(organization_id: string, user_id: string, session_id: string): Promise<ISessionEntity>
  setSessionStatus(organization_id: string, user_id: string, session_id: string, status: SessionStatusEnum): Promise<ISessionEntity>
}
