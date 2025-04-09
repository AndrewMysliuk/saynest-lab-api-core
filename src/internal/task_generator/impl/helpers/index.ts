import { ICorrectSentenceTask, IFillBlankTask, IListenAndTypeTask, IMatchTranslationTask, IMultipleChoiceTask, IReorderWordsTask, TaskTypeEnum } from "../../../../types"
import { validateToolResponse } from "../../../../utils"
import correctSentenceTask from "../json_schema/correct_sentence_task.schema.json"
import type correctSentenceSchema from "../json_schema/correct_sentence_task.schema.json"
import fillBlankTask from "../json_schema/fill_blank_task.schema.json"
import type fillBlankSchema from "../json_schema/fill_blank_task.schema.json"
import listenAndTypeTask from "../json_schema/listen_and_type_task.schema.json"
import type listenAndTypeSchema from "../json_schema/listen_and_type_task.schema.json"
import matchTranslationTask from "../json_schema/match_translation_task.schema.json"
import type matchTranslationSchema from "../json_schema/match_translation_task.schema.json"
import multipleChoiseTask from "../json_schema/multiple_choise_task.schema.json"
import type multipleChoiceSchema from "../json_schema/multiple_choise_task.schema.json"
import reorderWordsTask from "../json_schema/reorder_words_task.schema.json"
import type reorderWordsSchema from "../json_schema/reorder_words_task.schema.json"

type TaskTypeMap = {
  [TaskTypeEnum.FILL_BLANK]: {
    request_schema: typeof fillBlankSchema
    response_type: IFillBlankTask
  }
  [TaskTypeEnum.MATCH_TRANSLATION]: {
    request_schema: typeof matchTranslationSchema
    response_type: IMatchTranslationTask
  }
  [TaskTypeEnum.REORDER_WORDS]: {
    request_schema: typeof reorderWordsSchema
    response_type: IReorderWordsTask
  }
  [TaskTypeEnum.MULTIPLE_CHOICE]: {
    request_schema: typeof multipleChoiceSchema
    response_type: IMultipleChoiceTask
  }
  [TaskTypeEnum.CORRECT_SENTENCE]: {
    request_schema: typeof correctSentenceSchema
    response_type: ICorrectSentenceTask
  }
  [TaskTypeEnum.LISTEN_AND_TYPE]: {
    request_schema: typeof listenAndTypeSchema
    response_type: IListenAndTypeTask
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
    type: TaskTypeEnum.MATCH_TRANSLATION,
    schema: matchTranslationTask,
    parseResponse: (data) => data as IMatchTranslationTask,
  },
  {
    type: TaskTypeEnum.REORDER_WORDS,
    schema: reorderWordsTask,
    parseResponse: (data) => data as IReorderWordsTask,
  },
  {
    type: TaskTypeEnum.MULTIPLE_CHOICE,
    schema: multipleChoiseTask,
    parseResponse: (data) => data as IMultipleChoiceTask,
  },
  {
    type: TaskTypeEnum.CORRECT_SENTENCE,
    schema: correctSentenceTask,
    parseResponse: (data) => data as ICorrectSentenceTask,
  },
  {
    type: TaskTypeEnum.LISTEN_AND_TYPE,
    schema: listenAndTypeTask,
    parseResponse: (data) => data as IListenAndTypeTask,
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
