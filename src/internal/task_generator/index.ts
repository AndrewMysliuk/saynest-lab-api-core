import { ITaskGeneratorRequest, ITaskGeneratorResponse } from "../../types"

export interface ITaskGenerator {
  generateTask(request: ITaskGeneratorRequest): Promise<ITaskGeneratorResponse>
}
