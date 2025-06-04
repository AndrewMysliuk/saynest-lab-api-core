import { IMongooseOptions, ISessionCreateRequest, ISessionEntity } from "../../types"

export interface ISessionService {
  createSession(dto: ISessionCreateRequest): Promise<ISessionEntity>
  getSession(session_id: string): Promise<ISessionEntity>
  finishSession(session_id: string, options?: IMongooseOptions): Promise<ISessionEntity>
  deleteSession(session_id: string): Promise<void>
  getSessionsByUserId(user_id: string, options?: IMongooseOptions): Promise<ISessionEntity[]>
  deleteAllByUserId(user_id: string, options?: IMongooseOptions): Promise<void>
}
