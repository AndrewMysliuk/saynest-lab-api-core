import { Router } from "express"

import { IPromptService } from ".."
import { getPromptByIdHandler, getPromptsListHandler } from "../handlers"

export const createPromptRouter = (promptService: IPromptService): Router => {
  const router = Router()

  router.get("/", getPromptsListHandler(promptService))
  router.get("/:id", getPromptByIdHandler(promptService))

  return router
}
