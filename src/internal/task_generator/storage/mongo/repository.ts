import { Types } from "mongoose"

import { IRepository } from ".."
import { IGenericTaskEntity, IMongooseOptions } from "../../../../types"
import { createScopedLogger } from "../../../../utils"
import { TaskModel } from "./model"

const log = createScopedLogger("TaskGeneratorRepository")

export class TaskGeneratorRepository implements IRepository {
  async create(task: Partial<IGenericTaskEntity>, options?: IMongooseOptions): Promise<IGenericTaskEntity> {
    try {
      const result = await TaskModel.create([task], options)
      return result[0].toObject()
    } catch (error: unknown) {
      log.error("create", "Failed to create task", { error })
      throw error
    }
  }

  async setCompleted(task_id: Types.ObjectId, answers: Record<number, string>, options?: IMongooseOptions): Promise<IGenericTaskEntity | null> {
    try {
      return TaskModel.findOneAndUpdate(
        { _id: task_id },
        { $set: { is_completed: true, user_answers: answers, updated_at: new Date() } },
        {
          new: true,
          ...options,
        },
      )
    } catch (error: unknown) {
      log.error("setCompleted", "Failed to update task completion", { error })
      throw error
    }
  }

  async listByReviewId(user_id: Types.ObjectId, review_id: Types.ObjectId, options?: IMongooseOptions): Promise<IGenericTaskEntity[]> {
    try {
      const query = await TaskModel.find({ user_id, review_id }, null, options).lean()
      return query
    } catch (error: unknown) {
      log.error("listByReviewId", "Failed to list tasks", { error })
      throw error
    }
  }

  async getById(task_id: Types.ObjectId, options?: IMongooseOptions): Promise<IGenericTaskEntity | null> {
    try {
      const query = await TaskModel.findById(task_id, null, options).lean()

      return query
    } catch (error: unknown) {
      log.error("getById", "Failed to list tasks", { error })
      throw error
    }
  }
}
