import { IMongooseOptions, ISessionCreateRequest, ISessionEntity, SessionStatusEnum } from "../../../types"

export interface IRepository {
  createSession(dto: ISessionCreateRequest, options?: IMongooseOptions): Promise<ISessionEntity>
  getSession(session_id: string, options?: IMongooseOptions): Promise<ISessionEntity>
  setSessionStatus(session_id: string, status: SessionStatusEnum, options?: IMongooseOptions): Promise<ISessionEntity>
  deleteSession(session_id: string): Promise<void>
}
