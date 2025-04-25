import { Router } from "express"

import { IPromptService } from ".."
import { getModuleListHandler, getModuleScenariosHandler, getPromptByIdHandler, getPromptsListHandler } from "../handlers"

export const createPromptRouter = (promptService: IPromptService): Router => {
  const router = Router()

  router.get("/module", getModuleListHandler(promptService))
  router.get("/module/:module_id", getModuleScenariosHandler(promptService))
  router.get("/", getPromptsListHandler(promptService))
  router.get("/:id", getPromptByIdHandler(promptService))

  return router
}
