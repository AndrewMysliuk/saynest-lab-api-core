import { Request, RequestHandler, Response } from "express"

import { logger } from "../../../utils"
import { IUserProgressService } from "../../user_progress"
import { ITaskGenerator } from "../index"
import { TaskGeneratorRequestSchema, TaskGeneratorRequestType } from "./validation"

export const taskGeneratorHandler = (taskGeneratorService: ITaskGenerator, userProgressService: IUserProgressService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const parsed = TaskGeneratorRequestSchema.safeParse(req.body)

      if (!parsed.success) {
        logger.warn("taskGeneratorHandler | validation error:", parsed.error.format())
        res.status(400).json({ error: "Invalid request", details: parsed.error.format() })
        return
      }

      const user_id = req.user!.user_id
      const organization_id = req.user!.organization_id

      const validData: TaskGeneratorRequestType = parsed.data

      const result = await taskGeneratorService.generateTask({
        ...validData,
        user_id,
        organization_id,
      })

      await userProgressService.syncTaskProgress(user_id, result)

      res.status(200).json(result)
    } catch (error: unknown) {
      logger.error("taskGeneratorHandler | error:", error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const setCompletedHandler = (taskGeneratorService: ITaskGenerator): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { task_id } = req.params

      if (!task_id) {
        res.status(400).json({ error: "Missing task_id in URL params" })
        return
      }

      await taskGeneratorService.setCompleted(task_id)

      res.status(204).send()
    } catch (error: unknown) {
      logger.error("setCompletedHandler | error:", error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const listByReviewHandler = (taskGeneratorService: ITaskGenerator): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { review_id } = req.params
      const user_id = req.user!.user_id

      if (!review_id || typeof review_id !== "string") {
        res.status(400).json({ error: "Missing task_id in URL params" })
        return
      }

      const result = await taskGeneratorService.listByReviewId(user_id, review_id)
      res.status(200).json(result)
    } catch (error: unknown) {
      logger.error("listByReviewHandler | error:", error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}
