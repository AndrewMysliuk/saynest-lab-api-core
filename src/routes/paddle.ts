import express, { Request, Response, Router } from "express"

import { OrganisationService } from "../internal/organisation/impl"
import { OrganisationRepository } from "../internal/organisation/storage/mongo/repository"
import { PlanService } from "../internal/plans/impl"
import { PlanRepository } from "../internal/plans/storage/mongo/repository"
import { SubscriptionService } from "../internal/subscription/impl"
import { SubscriptionRepository } from "../internal/subscription/storage/mongo/repository"
import { WEBHOOK_INVALID_PAYLOAD, WEBHOOK_INVALID_SIGNATURE, createScopedLogger, validatePaddleWebhook } from "../utils"

const organisationRepo = new OrganisationRepository()
const planRepository = new PlanRepository()
const subscriptionRepository = new SubscriptionRepository()

const organisationService = new OrganisationService(organisationRepo)
const planService = new PlanService(planRepository)
const subscriptionService = new SubscriptionService(subscriptionRepository, organisationService, planService)

const log = createScopedLogger("PaddleWebhook")

const paddleRouter = Router()

paddleRouter.post("/webhooks/paddle", express.raw({ type: "application/json" }), async (req: Request, res: Response) => {
  const signature = (req.headers["paddle-signature"] as string) ?? ""
  const method = "paddleWebhookHandler"

  try {
    const rawBody = req.body.toString()
    const event = await validatePaddleWebhook(rawBody, signature)

    log.info(method, "Valid Paddle webhook event", { event_type: event.eventType })

    switch (event.eventType) {
      // Subscription Events
      case "subscription.canceled":
        log.info(method, "Subscription canceled hook", { event_data_id: event.data.id })

        await subscriptionService.cancelledSubscription(event.data.id)

        break

      case "subscription.created":
        log.info(method, "Subscription created hook", { event_data_id: event.data.id })

        await subscriptionService.createSubscription(event.data.id)

        break

      case "subscription.past_due":
        log.info(method, "Subscription past due hook", { event_data_id: event.data.id })

        await subscriptionService.pastDueSubscription(event.data.id)

        break

      case "subscription.updated":
        log.info(method, "Subscription updated hook", { event_data_id: event.data.id })

        await subscriptionService.updateSubscription(event.data.id)

        break

      default:
        log.info(method, "Event not handled hook", { event_type: event.eventType })
    }

    res.status(200).send("Webhook processed")
  } catch (error: any) {
    const message = error?.message

    if (message === WEBHOOK_INVALID_SIGNATURE) {
      log.warn(method, "Rejected webhook", { error: message })
      res.status(403).send(message)
      return
    }

    log.error(method, "Webhook handler failed", { error: message })
    res.status(400).send(WEBHOOK_INVALID_PAYLOAD)
    return
  }
})

export default paddleRouter
