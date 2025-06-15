import { paddle, serverConfig } from "../config"
import { createScopedLogger } from "../utils"

const log = createScopedLogger("PaddleWebhook")

const webhookSecret = serverConfig.PADDLE_WEBHOOK_SECRET

if (!webhookSecret) {
  throw new Error("PADDLE_WEBHOOK_SECRET is not set!")
}

export async function validatePaddleWebhook(rawBody: string, signature?: string) {
  const isProd = process.env.NODE_ENV === "production"

  if (!signature) {
    if (!isProd) {
      return JSON.parse(rawBody)
    }
    throw new Error("Missing paddle-signature header")
  }

  try {
    return paddle.webhooks.unmarshal(rawBody, webhookSecret, signature)
  } catch (error) {
    throw new Error("Invalid signature or malformed webhook")
  }
}
