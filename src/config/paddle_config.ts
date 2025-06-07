import { Environment, Paddle } from "@paddle/paddle-node-sdk"

import { serverConfig } from "../config"
import { createScopedLogger } from "../utils"

const PADDLE_API_KEY = serverConfig.PADDLE_API_KEY

if (!PADDLE_API_KEY) {
  throw new Error("paddle credentials is not set!")
}

const log = createScopedLogger("PaddleRequest")

export const paddle = new Paddle(PADDLE_API_KEY, {
  environment: process.env.NODE_ENV === "development" ? Environment.sandbox : Environment.production,
})

export async function getProductList() {
  try {
    const products = await paddle.products.list()
    return products
  } catch (error) {
    console.error("Failed to get products:", error)
    throw error
  }
}

export async function getSubscription(subscription_id: string) {
  try {
    const subscription = await paddle.subscriptions.get(subscription_id)
    return subscription
  } catch (error) {
    console.error("Failed to get subscription:", error)
    throw error
  }
}

export async function cancelSubscription(subscription_id: string) {
  try {
    const result = await paddle.subscriptions.cancel(subscription_id)

    return result
  } catch (error) {
    console.error("Failed to cancel subscription:", error)
    throw error
  }
}
