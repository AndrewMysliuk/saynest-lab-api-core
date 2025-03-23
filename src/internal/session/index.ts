import { ISessionEntity, SessionTypeEnum } from "../../types"

export interface ISessionService {
  createSession(system_prompt: string, type: SessionTypeEnum): Promise<ISessionEntity>
  getSession(session_id: string): Promise<ISessionEntity>
  finishSession(session_id: string): Promise<ISessionEntity>
}
