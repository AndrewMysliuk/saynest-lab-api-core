import { Router } from "express"

import { ISubscriptionService } from ".."
import { superUserOnlyMiddleware } from "../../../middlewares"
import {
  activateFromTrialSubscriptionHandler,
  cancelSubscriptionHandler,
  changePlanSubscriptionHandler,
  createSubscriptionHandler,
  getByOrgIdHandler,
  getPaymentDetailsLinkHandler,
  recancelSubscriptionHandler,
} from "../handlers"

export const createSubscriptionRouter = (subscriptionService: ISubscriptionService): Router => {
  const router = Router()

  router.post("/", superUserOnlyMiddleware, createSubscriptionHandler(subscriptionService))
  router.get("/org-info", getByOrgIdHandler(subscriptionService))
  router.get("/payment-details-link", getPaymentDetailsLinkHandler(subscriptionService))
  router.post("/cancel", cancelSubscriptionHandler(subscriptionService))
  router.post("/recancel", recancelSubscriptionHandler(subscriptionService))
  router.post("/activate-from-trial", activateFromTrialSubscriptionHandler(subscriptionService))
  router.patch("/change-plan/:plan_id", changePlanSubscriptionHandler(subscriptionService))

  return router
}
