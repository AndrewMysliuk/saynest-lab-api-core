import { Request, RequestHandler, Response } from "express"

import { IPlanService } from ".."
import { createScopedLogger } from "../../../utils"
import { createPlanSchema } from "./validation"

const log = createScopedLogger("PlanHandler")

export const createPlanHandler = (planService: IPlanService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const parseResult = createPlanSchema.safeParse(req.body)

      if (!parseResult.success) {
        res.status(400).json({ error: "Invalid request", details: parseResult.error.format() })
        return
      }

      const dto = parseResult.data

      const response = await planService.create(dto)

      res.status(200).json(response)
    } catch (error: unknown) {
      log.error("createPlanHandler", "error", { error })
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const getPublicPlanListHandler = (planService: IPlanService): RequestHandler => {
  return async (_req: Request, res: Response): Promise<void> => {
    try {
      const response = await planService.publicList()

      res.status(200).json(response)
    } catch (error: unknown) {
      log.error("getPublicPlanListHandler", "error", { error })
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}
