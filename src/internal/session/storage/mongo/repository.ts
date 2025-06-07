import { Types } from "mongoose"

import { IRepository } from ".."
import { IMongooseOptions, ISessionCreateRequest, ISessionEntity, SessionStatusEnum } from "../../../../types"
import { createScopedLogger } from "../../../../utils"
import { SessionModel } from "./model"

const log = createScopedLogger("SessionRepository")

export class SessionRepository implements IRepository {
  async createSession(dto: ISessionCreateRequest, options?: IMongooseOptions): Promise<ISessionEntity> {
    try {
      const session = new SessionModel({
        ...dto,
        status: SessionStatusEnum.ACTIVE,
        updated_at: new Date(),
        created_at: new Date(),
      })

      await session.save({ session: options?.session })

      return session.toObject()
    } catch (error: unknown) {
      log.error("createSession", "error", { error })
      throw error
    }
  }

  async getSession(session_id: string, options?: IMongooseOptions): Promise<ISessionEntity> {
    try {
      const session = await SessionModel.findById({
        _id: new Types.ObjectId(session_id),
      }).session(options?.session || null)

      if (!session) {
        throw new Error(`session with ID ${session_id} not found`)
      }

      return session.toObject()
    } catch (error: unknown) {
      log.error("getSession", "error", { error })
      throw error
    }
  }

  async setSessionStatus(session_id: string, status: SessionStatusEnum, options?: IMongooseOptions): Promise<ISessionEntity> {
    try {
      const update: Partial<ISessionEntity> = {
        status,
      }

      if (status === SessionStatusEnum.FINISHED) {
        update.ended_at = new Date()
      }

      const session = await SessionModel.findByIdAndUpdate(
        {
          _id: new Types.ObjectId(session_id),
        },
        update,
        { new: true },
      ).session(options?.session || null)

      if (!session) {
        throw new Error(`session with ID ${session_id} not found`)
      }

      return session.toObject()
    } catch (error: unknown) {
      log.error("setSessionStatus", "error", { error })
      throw error
    }
  }

  async deleteSession(session_id: string, options?: IMongooseOptions): Promise<void> {
    try {
      await SessionModel.findByIdAndDelete(session_id).session(options?.session || null)

      return
    } catch (error: unknown) {
      log.error("deleteSession", "error", { error })
      throw error
    }
  }

  async getSessionsByUserId(user_id: string, options?: IMongooseOptions): Promise<ISessionEntity[]> {
    try {
      const sessions = await SessionModel.find({
        user_id: new Types.ObjectId(user_id),
      }).session(options?.session || null)

      return sessions.map((session) => session.toObject())
    } catch (error: unknown) {
      log.error("getSessionsByUserId", "error", { error })
      throw error
    }
  }

  async deleteAllByUserId(user_id: string, options?: IMongooseOptions): Promise<void> {
    try {
      await SessionModel.deleteMany({ user_id }).session(options?.session || null)

      return
    } catch (error: unknown) {
      log.error("deleteAllByUserId", "error", { error })
      throw error
    }
  }
}
