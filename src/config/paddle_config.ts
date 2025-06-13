import { Environment, Paddle } from "@paddle/paddle-node-sdk"

import { serverConfig } from "../config"
import { createScopedLogger } from "../utils"

const PADDLE_API_KEY = serverConfig.PADDLE_API_KEY

if (!PADDLE_API_KEY) {
  throw new Error("paddle credentials is not set!")
}

const log = createScopedLogger("PaddleRequest")

export const paddle = new Paddle(PADDLE_API_KEY, {
  environment: process.env.NODE_ENV === "production" ? Environment.production : Environment.sandbox,
})

export async function cancelSubscription(subscription_id: string) {
  try {
    const result = await paddle.subscriptions.cancel(subscription_id)

    return result
  } catch (error) {
    console.error("Failed to cancel subscription:", error)
    throw error
  }
}

export async function recancelSubscription(subscription_id: string) {
  try {
    const result = await paddle.subscriptions.update(subscription_id, {
      scheduledChange: null,
    })

    return result
  } catch (error) {
    console.error("Failed to recancel subscription:", error)
    throw error
  }
}

export async function changePlanSubscription(subscription_id: string, paddle_price_id: string) {
  try {
    const result = await paddle.subscriptions.update(subscription_id, {
      prorationBillingMode: "prorated_immediately",
      items: [
        {
          priceId: paddle_price_id,
          quantity: 1,
        },
      ],
    })

    return result
  } catch (error) {
    console.error("Failed to change plan subscription:", error)
    throw error
  }
}

export async function activateSubscription(subscription_id: string) {
  try {
    const result = await paddle.subscriptions.activate(subscription_id)

    return result
  } catch (error) {
    console.error("Failed to activate subscription:", error)
    throw error
  }
}

export async function getSubscription(subscription_id: string) {
  try {
    const result = await paddle.subscriptions.get(subscription_id)

    return result
  } catch (error) {
    console.error("Failed to get subscription:", error)
    throw error
  }
}
