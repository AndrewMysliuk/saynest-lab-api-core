import fs from "fs"
import { Types } from "mongoose"
import path from "path"

import { IRepository } from ".."
import { IMongooseOptions, ISessionCreateRequest, ISessionEntity, SessionStatusEnum, SessionTypeEnum } from "../../../../types"
import logger from "../../../../utils/logger"
import { SessionModel } from "./model"

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
      logger.error(`createSession | error: ${error}`)
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
      logger.error(`getSession | error: ${error}`)
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
      logger.error(`setSessionStatus | error: ${error}`)
      throw error
    }
  }

  async deleteSession(session_id: string, options?: IMongooseOptions): Promise<void> {
    try {
      await SessionModel.findByIdAndDelete(session_id).session(options?.session || null)

      return
    } catch (error: unknown) {
      logger.error(`deleteSession | error: ${error}`)
      throw error
    }
  }
}
