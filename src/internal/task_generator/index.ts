import { IGenericTask, ITaskGeneratorRequest, TaskTypeEnum } from "../../types"
import { TaskTypeMap } from "./impl/helpers"

export interface ITaskGenerator {
  generateTask<T extends TaskTypeEnum>(request: ITaskGeneratorRequest & { type: T }): Promise<IGenericTask<TaskTypeMap[T]["response_type"]>>
}
