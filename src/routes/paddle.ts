import express, { Request, Response, Router } from "express"

import { OrganisationService } from "../internal/organisation/impl"
import { OrganisationRepository } from "../internal/organisation/storage/mongo/repository"
import { PlanService } from "../internal/plans/impl"
import { PlanRepository } from "../internal/plans/storage/mongo/repository"
import { SubscriptionService } from "../internal/subscription/impl"
import { SubscriptionRepository } from "../internal/subscription/storage/mongo/repository"
import { createScopedLogger, validatePaddleWebhook } from "../utils"

const organisationRepo = new OrganisationRepository()
const planRepository = new PlanRepository()
const subscriptionRepository = new SubscriptionRepository()

const organisationService = new OrganisationService(organisationRepo)
const planService = new PlanService(planRepository)
const subscriptionService = new SubscriptionService(subscriptionRepository, organisationService, planService)

const log = createScopedLogger("PaddleWebhook")

const paddleRouter = Router()

paddleRouter.post("/webhooks/paddle", express.text({ type: "*/*" }), async (req: Request, res: Response) => {
  const signature = (req.headers["paddle-signature"] as string) ?? undefined
  const method = "paddleWebhookHandler"

  try {
    log.info(method, "Paddle req.body", { request: req.body })

    const rawBody = req.body
    const event = await validatePaddleWebhook(rawBody, signature)

    log.info(method, "Valid Paddle webhook event", { event, event_type: event.event_type })

    switch (event.event_type) {
      // Subscription Events
      case "subscription.canceled":
        log.info(method, "Subscription canceled", { event_data_id: event.data.id })

        await subscriptionService.cancelledSubscription(event.data.id)

        break

      case "subscription.created":
        log.info(method, "Subscription created", { event_data_id: event.data.id })

        await subscriptionService.createSubscription(event.data.id)

        break

      case "subscription.past_due":
        log.info(method, "Subscription past due", { event_data_id: event.data.id })

        await subscriptionService.pastDueSubscription(event.data.id)

        break

      case "subscription.updated":
        log.info(method, "Subscription updated", { event_data_id: event.data.id })

        await subscriptionService.updateSubscription(event.data.id)

        break

      default:
        log.info(method, "Event not handled", { event_type: event.event_type })
    }

    res.status(200).send("Webhook processed")
  } catch (error) {
    log.error(method, "Webhook processing error", { error })
    res.status(400).send("Invalid webhook")
  }
})

export default paddleRouter
