import { Router } from "express"

import { IPlanService } from ".."
import { superUserOnlyMiddleware } from "../../../middlewares"
import { createPlanHandler, getPlanByIdHandler, getPublicPlanListHandler } from "../handlers"

export const createPlanRouter = (planService: IPlanService): Router => {
  const router = Router()

  router.post("/", superUserOnlyMiddleware, createPlanHandler(planService))
  router.get("/", getPublicPlanListHandler(planService))
  router.get("/:plan_id", getPlanByIdHandler(planService))

  return router
}
