import { Router } from "express"

import { ITaskGenerator } from ".."
import { IUserProgressService } from "../../user_progress"
import { getTaskHandler, listByReviewHandler, setCompletedHandler, taskGeneratorHandler } from "../handlers"

export const createTaskGeneratorRouter = (taskGeneratorService: ITaskGenerator, userProgressService: IUserProgressService): Router => {
  const router = Router()

  router.post("/", taskGeneratorHandler(taskGeneratorService, userProgressService))
  router.get("/:task_id", getTaskHandler(taskGeneratorService))
  router.patch("/:task_id/completed", setCompletedHandler(taskGeneratorService))
  router.get("/review/:review_id", listByReviewHandler(taskGeneratorService))

  return router
}
