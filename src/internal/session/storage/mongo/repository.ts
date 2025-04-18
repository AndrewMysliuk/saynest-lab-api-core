import fs from "fs"
import { Types } from "mongoose"
import path from "path"

import { IRepository } from ".."
import { IMongooseOptions, ISessionEntity, SessionStatusEnum, SessionTypeEnum } from "../../../../types"
import { SessionModel } from "./model"

export class SessionRepository implements IRepository {
  async createSession(prompt_id: string, system_prompt: string, session_directory: string, type: SessionTypeEnum, options?: IMongooseOptions): Promise<ISessionEntity> {
    const session = new SessionModel({
      // organization_id: new Types.ObjectId(organization_id),
      // user_id: new Types.ObjectId(user_id),
      prompt_id,
      type,
      system_prompt,
      session_directory,
      status: SessionStatusEnum.ACTIVE,
      updated_at: new Date(),
      created_at: new Date(),
    })

    await session.save({ session: options?.session })

    return session.toObject()
  }

  async getSession(session_id: string, options?: IMongooseOptions): Promise<ISessionEntity> {
    const session = await SessionModel.findById({
      _id: new Types.ObjectId(session_id),
      // organization_id: new Types.ObjectId(organization_id),
      // user_id: new Types.ObjectId(user_id),
    }).session(options?.session || null)

    if (!session) {
      throw new Error(`session with ID ${session_id} not found`)
    }

    return session.toObject()
  }

  async setSessionStatus(session_id: string, status: SessionStatusEnum, options?: IMongooseOptions): Promise<ISessionEntity> {
    const update: Partial<ISessionEntity> = {
      status,
    }

    if (status === SessionStatusEnum.FINISHED) {
      update.ended_at = new Date()
    }

    const session = await SessionModel.findByIdAndUpdate(
      {
        _id: new Types.ObjectId(session_id),
        // organization_id: new Types.ObjectId(organization_id),
        // user_id: new Types.ObjectId(user_id),
      },
      update,
      { new: true },
    ).session(options?.session || null)

    if (!session) {
      throw new Error(`session with ID ${session_id} not found`)
    }

    return session.toObject()
  }
}
