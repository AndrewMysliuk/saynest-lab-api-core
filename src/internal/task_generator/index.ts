import { IGenericTaskEntity, ITaskGeneratorRequest, TaskTypeEnum } from "../../types"
import { TaskTypeMap } from "./impl/helpers"

export interface ITaskGenerator {
  generateTask<T extends TaskTypeEnum>(request: ITaskGeneratorRequest & { type: T }): Promise<IGenericTaskEntity<TaskTypeMap[T]["response_type"]>>
  setCompleted(task_id: string): Promise<void>
  listByReviewId(user_id: string, review_id: string): Promise<IGenericTaskEntity[]>
  getById(task_id: string): Promise<IGenericTaskEntity | null>
}
