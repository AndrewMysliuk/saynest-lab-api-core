import { IMongooseOptions, ISessionEntity, SessionStatusEnum, SessionTypeEnum } from "../../../types"

export interface IRepository {
  createSession(prompt_id: string, system_prompt: string, session_directory: string, type: SessionTypeEnum, options?: IMongooseOptions): Promise<ISessionEntity>
  getSession(session_id: string, options?: IMongooseOptions): Promise<ISessionEntity>
  setSessionStatus(session_id: string, status: SessionStatusEnum, options?: IMongooseOptions): Promise<ISessionEntity>
}
