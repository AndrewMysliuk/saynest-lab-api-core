import fs from "fs"
import { Types } from "mongoose"
import path from "path"

import { IRepository } from ".."
import { ISessionEntity, SessionStatusEnum, SessionTypeEnum } from "../../../../types"
import { SessionModel } from "./model"

export class SessionRepository implements IRepository {
  async createSession(organization_id: string, user_id: string, system_prompt: string, type: SessionTypeEnum): Promise<ISessionEntity> {
    const _id = new Types.ObjectId()

    const session_directory = path.join(__dirname, "../../../../../user_sessions", _id.toString())
    await fs.promises.mkdir(session_directory, { recursive: true })

    const session = await SessionModel.create({
      _id,
      organization_id: new Types.ObjectId(organization_id),
      user_id: new Types.ObjectId(user_id),
      type,
      system_prompt,
      session_directory,
      status: SessionStatusEnum.ACTIVE,
      updated_at: new Date(),
      created_at: new Date(),
    })

    return session.toObject()
  }

  async getSession(organization_id: string, user_id: string, session_id: string): Promise<ISessionEntity> {
    const session = await SessionModel.findById({
      _id: new Types.ObjectId(session_id),
      organization_id: new Types.ObjectId(organization_id),
      user_id: new Types.ObjectId(user_id),
    })

    if (!session) {
      throw new Error(`session with ID ${session_id} not found`)
    }

    return session.toObject()
  }

  async setSessionStatus(organization_id: string, user_id: string, session_id: string, status: SessionStatusEnum): Promise<ISessionEntity> {
    const update: Partial<ISessionEntity> = {
      status,
    }

    if (status === SessionStatusEnum.FINISHED) {
      update.ended_at = new Date()
    }

    const session = await SessionModel.findByIdAndUpdate(
      {
        _id: new Types.ObjectId(session_id),
        organization_id: new Types.ObjectId(organization_id),
        user_id: new Types.ObjectId(user_id),
      },
      update,
      { new: true },
    )

    if (!session) {
      throw new Error(`session with ID ${session_id} not found`)
    }

    return session.toObject()
  }
}
