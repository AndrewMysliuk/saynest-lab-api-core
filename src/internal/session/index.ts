import { IMongooseOptions, ISessionEntity, SessionTypeEnum } from "../../types"

export interface ISessionService {
  createSession(prompt_id: string, system_prompt: string, session_directory: string, type: SessionTypeEnum): Promise<ISessionEntity>
  getSession(session_id: string): Promise<ISessionEntity>
  finishSession(session_id: string, options?: IMongooseOptions): Promise<ISessionEntity>
}
