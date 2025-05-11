import { Router } from "express"

import { ITaskGenerator } from ".."
import { listByReviewHandler, setCompletedHandler, taskGeneratorHandler } from "../handlers"

export const createTaskGeneratorRouter = (taskGeneratorService: ITaskGenerator): Router => {
  const router = Router()

  router.post("/", taskGeneratorHandler(taskGeneratorService))
  router.patch("/:task_id/completed", setCompletedHandler(taskGeneratorService))
  router.get("/review/:review_id", listByReviewHandler(taskGeneratorService))

  return router
}
