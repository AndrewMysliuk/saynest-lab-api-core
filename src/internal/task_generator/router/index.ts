import { Router } from "express"

import { ITaskGenerator } from ".."
import { taskGeneratorHandler } from "../handlers"

export const createTaskGeneratorRouter = (taskGeneratorService: ITaskGenerator): Router => {
  const router = Router()

  router.post("/", taskGeneratorHandler(taskGeneratorService))

  return router
}
