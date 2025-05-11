import { Types } from "mongoose"

import { IRepository } from ".."
import { IGenericTaskEntity, IMongooseOptions } from "../../../../types"
import { logger } from "../../../../utils"
import { TaskModel } from "./model"

export class TaskGeneratorRepository implements IRepository {
  async create(task: Partial<IGenericTaskEntity>, options?: IMongooseOptions): Promise<IGenericTaskEntity> {
    try {
      const result = await TaskModel.create([task], options)
      return result[0].toObject()
    } catch (err) {
      logger.error("[TaskRepository.create] Failed to create task", { error: err })
      throw err
    }
  }

  async setCompleted(task_id: Types.ObjectId, options?: IMongooseOptions): Promise<void> {
    try {
      await TaskModel.updateOne({ _id: task_id }, { $set: { is_completed: true, updated_at: new Date() } }, options || {})
    } catch (err) {
      logger.error("[TaskRepository.setCompleted] Failed to update task completion", { error: err, task_id })
      throw err
    }
  }

  async listByReviewId(user_id: Types.ObjectId, review_id: Types.ObjectId, options?: IMongooseOptions): Promise<IGenericTaskEntity[]> {
    try {
      const query = await TaskModel.find({ user_id, review_id }, null, options).lean()
      return query
    } catch (err) {
      logger.error("[TaskRepository.listByReviewId] Failed to list tasks", { error: err, user_id, review_id })
      throw err
    }
  }
}
