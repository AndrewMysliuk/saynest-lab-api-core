import { ITaskGenerator } from ".."
import { openaiREST } from "../../../config"
import { ITaskGeneratorRequest, ITaskGeneratorResponse } from "../../../types"
import logger from "../../../utils/logger"
import correctSentenceTask from "./json_schema/correct_sentence_task.schema.json"
import fillBlankTask from "./json_schema/fill_blank_task.schema.json"
import freeAnswerTask from "./json_schema/free_answer_task.schema.json"
import listenAndTypeTask from "./json_schema/listen_and_type_task.schema.json"
import matchTranslationTask from "./json_schema/match_translation_task.schema.json"
import multipleChoiseTask from "./json_schema/multiple_choise_task.schema.json"
import reorder_words_task from "./json_schema/reorder_words_task.schema.json"

export class TaskGeneratorService implements ITaskGenerator {
  async generateTask(request: ITaskGeneratorRequest): Promise<ITaskGeneratorResponse> {
    return {} as ITaskGeneratorResponse
  }
}
