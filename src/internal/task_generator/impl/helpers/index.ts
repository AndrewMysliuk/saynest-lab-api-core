import { IFillBlankTask, IMultipleChoiceTask, TaskTypeEnum } from "../../../../types"
import { validateToolResponse } from "../../../../utils"
import fillBlankTask from "../json_schema/fill_blank_task.schema.json"
import type fillBlankSchema from "../json_schema/fill_blank_task.schema.json"
import multipleChoiseTask from "../json_schema/multiple_choise_task.schema.json"
import type multipleChoiceSchema from "../json_schema/multiple_choise_task.schema.json"

export type TaskTypeMap = {
  [TaskTypeEnum.FILL_BLANK]: {
    request_schema: typeof fillBlankSchema
    response_type: IFillBlankTask
  }
  [TaskTypeEnum.MULTIPLE_CHOICE]: {
    request_schema: typeof multipleChoiceSchema
    response_type: IMultipleChoiceTask
  }
}

const taskDefinitions: {
  type: TaskTypeEnum
  schema: TaskTypeMap[TaskTypeEnum]["request_schema"]
  parseResponse: (data: unknown) => TaskTypeMap[TaskTypeEnum]["response_type"]
}[] = [
  {
    type: TaskTypeEnum.FILL_BLANK,
    schema: fillBlankTask,
    parseResponse: (data) => data as IFillBlankTask,
  },
  {
    type: TaskTypeEnum.MULTIPLE_CHOICE,
    schema: multipleChoiseTask,
    parseResponse: (data) => data as IMultipleChoiceTask,
  },
]

export function getTaskDefinition<T extends TaskTypeEnum>(
  type: T,
): {
  schema: TaskTypeMap[T]["request_schema"]
  parseResponse: (data: unknown) => TaskTypeMap[T]["response_type"]
} {
  const def = taskDefinitions.find((d) => d.type === type)

  if (!def) {
    throw new Error(`Unsupported task type: ${type}`)
  }

  const schema = def.schema as TaskTypeMap[T]["request_schema"]

  return {
    schema,
    parseResponse: (data: unknown) => validateToolResponse<TaskTypeMap[T]["response_type"]>(data, schema),
  }
}
