import { EventEntity } from "@paddle/paddle-node-sdk"

import { paddle, serverConfig } from "../config"

const webhookSecret = serverConfig.PADDLE_WEBHOOK_SECRET

if (!webhookSecret) {
  throw new Error("PADDLE_WEBHOOK_SECRET is not set!")
}

export async function validatePaddleWebhook(rawBody: string, signature?: string): Promise<EventEntity> {
  try {
    const isProd = process.env.NODE_ENV === "production"

    if (!signature) {
      if (!isProd) {
        return JSON.parse(rawBody)
      }
      throw new Error("Missing paddle-signature header")
    }

    const response = await paddle.webhooks.unmarshal(rawBody, webhookSecret, signature)

    return response
  } catch (error) {
    throw new Error("Invalid signature or malformed webhook")
  }
}
