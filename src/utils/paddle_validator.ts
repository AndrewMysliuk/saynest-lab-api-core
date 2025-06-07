import { paddle, serverConfig } from "../config"
import { createScopedLogger } from "../utils"

const log = createScopedLogger("PaddleWebhook")

const webhookSecret = serverConfig.PADDLE_WEBHOOK_SECRET

if (!webhookSecret) {
  throw new Error("PADDLE_WEBHOOK_SECRET is not set!")
}

export async function validatePaddleWebhook(rawBody: string, signature: string) {
  if (!signature) {
    throw new Error("Missing paddle-signature header")
  }

  try {
    const event = await paddle.webhooks.unmarshal(rawBody, webhookSecret, signature)
    return event
  } catch (error) {
    log.error("validatePaddleWebhook", "Invalid Paddle webhook signature:", { error })
    throw new Error("Invalid signature or corrupted webhook data")
  }
}
