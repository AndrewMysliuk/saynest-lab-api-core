import { Router } from "express"

import { ISubscriptionService } from ".."
import { superUserOnlyMiddleware } from "../../../middlewares"
import { createSubscriptionHandler, getByOrgIdHandler } from "../handlers"

export const createSubscriptionRouter = (subscriptionService: ISubscriptionService): Router => {
  const router = Router()

  router.post("/", superUserOnlyMiddleware, createSubscriptionHandler(subscriptionService))
  router.get("/org-info", getByOrgIdHandler(subscriptionService))

  return router
}
