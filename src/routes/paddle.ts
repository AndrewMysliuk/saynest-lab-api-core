import express, { Request, Response, Router } from "express"

import { createScopedLogger, validatePaddleWebhook } from "../utils"

const log = createScopedLogger("PaddleWebhook")

const paddleRouter = Router()

paddleRouter.post("/webhooks/paddle", express.raw({ type: "application/json" }), async (req: Request, res: Response) => {
  const signature = req.headers["paddle-signature"] as string
  const rawBody = req.body.toString()
  const method = "paddleWebhookHandler"

  try {
    const event = await validatePaddleWebhook(rawBody, signature)

    log.info(method, "Valid Paddle webhook event", { event_type: event.eventType })

    switch (event.eventType) {
      case "subscription.updated":
        log.info(method, "Subscription updated", { event_data_id: event.data.id })
        // TODO: handle notification
        break

      case "subscription.canceled":
        log.info(method, "Subscription canceled", { event_data_id: event.data.id })
        // TODO: handle notification
        break

      case "subscription.past_due":
        log.info(method, "Subscription past due", { event_data_id: event.data.id })
        // TODO: handle notification
        break

      default:
        log.info(method, "Event not handled", { event_type: event.eventType })
    }

    res.status(200).send("Webhook processed")
  } catch (error) {
    log.error(method, "Webhook processing error", { error })
    res.status(400).send("Invalid webhook")
  }
})

export default paddleRouter
