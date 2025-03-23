import fs from "fs"
import { Types } from "mongoose"
import path from "path"

import { IRepository } from ".."
import { ISessionEntity, SessionStatusEnum, SessionTypeEnum } from "../../../../types"
import { SessionModel } from "./model"

export class SessionRepository implements IRepository {
  async createSession(system_prompt: string, type: SessionTypeEnum): Promise<ISessionEntity> {
    const _id = new Types.ObjectId()

    const session_directory = path.join(__dirname, "../../../../../user_sessions", _id.toString())
    await fs.promises.mkdir(session_directory, { recursive: true })

    const session = await SessionModel.create({
      _id,
      type,
      system_prompt,
      session_directory,
      status: SessionStatusEnum.ACTIVE,
      created_at: new Date(),
    })

    return session.toObject()
  }

  async getSession(session_id: string): Promise<ISessionEntity> {
    const session = await SessionModel.findById(session_id)

    if (!session) {
      throw new Error(`session with ID ${session_id} not found`)
    }

    return session.toObject()
  }

  async setSessionStatus(session_id: string, status: SessionStatusEnum): Promise<ISessionEntity> {
    const update: Partial<ISessionEntity> = {
      status,
    }

    if (status === SessionStatusEnum.FINISHED) {
      update.ended_at = new Date()
    }

    const session = await SessionModel.findByIdAndUpdate(session_id, update, { new: true })

    if (!session) {
      throw new Error(`session with ID ${session_id} not found`)
    }

    return session.toObject()
  }
}
