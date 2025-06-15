import { EventEntity } from "@paddle/paddle-node-sdk"

import { paddle, serverConfig } from "../config"

const webhookSecret = serverConfig.PADDLE_WEBHOOK_SECRET

export const WEBHOOK_INVALID_SIGNATURE = "WEBHOOK.INVALID_SIGNATURE"
export const WEBHOOK_INVALID_PAYLOAD = "WEBHOOK.INVALID_PAYLOAD"

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
      throw new Error(WEBHOOK_INVALID_SIGNATURE)
    }

    const response = await paddle.webhooks.unmarshal(rawBody, webhookSecret, signature)

    return response
  } catch (error) {
    throw new Error(WEBHOOK_INVALID_SIGNATURE)
  }
}
