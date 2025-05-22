import { Router } from "express"

import { ITaskGenerator } from ".."
import { IUserProgressService } from "../../user_progress"
import { listByReviewHandler, setCompletedHandler, taskGeneratorHandler } from "../handlers"

export const createTaskGeneratorRouter = (taskGeneratorService: ITaskGenerator, userProgressService: IUserProgressService): Router => {
  const router = Router()

  router.post("/", taskGeneratorHandler(taskGeneratorService, userProgressService))
  router.patch("/:task_id/completed", setCompletedHandler(taskGeneratorService))
  router.get("/review/:review_id", listByReviewHandler(taskGeneratorService))

  return router
}
