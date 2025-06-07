import { Request, RequestHandler, Response } from "express"

import { createScopedLogger } from "../../../utils"
import { IUserProgressService } from "../../user_progress"
import { ITaskGenerator } from "../index"
import { TaskGeneratorRequestSchema, TaskGeneratorRequestType } from "./validation"

const log = createScopedLogger("TaskGeneratorHandler")

export const taskGeneratorHandler = (taskGeneratorService: ITaskGenerator, userProgressService: IUserProgressService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const parsed = TaskGeneratorRequestSchema.safeParse(req.body)

      if (!parsed.success) {
        log.warn("taskGeneratorHandler", "validation error", {
          error: parsed.error.format(),
        })
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
      log.error("taskGeneratorHandler", "error", { error })
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const getTaskHandler = (taskGeneratorService: ITaskGenerator): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { task_id } = req.params

      if (!task_id) {
        res.status(400).json({ error: "Missing task_id in URL params" })
        return
      }

      const result = await taskGeneratorService.getById(task_id)

      res.status(200).json(result)
    } catch (error: unknown) {
      log.error("getTaskHandler", "error", { error })
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const setCompletedHandler = (taskGeneratorService: ITaskGenerator, userProgressService: IUserProgressService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { task_id } = req.params
      const { answers } = req.body
      const user_id = req.user!.user_id

      if (!task_id || !answers || typeof answers !== "object") {
        res.status(400).json({ error: "Missing task_id in URL params" })
        return
      }

      const result = await taskGeneratorService.setCompleted(task_id, answers)

      await userProgressService.syncTaskProgress(user_id, result)

      res.status(204).send()
    } catch (error: unknown) {
      log.error("setCompletedHandler", "error", { error })
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
      log.error("listByReviewHandler", "error", { error })
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}
