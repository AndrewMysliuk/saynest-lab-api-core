import { createHmac } from "crypto"

import { paddle, serverConfig } from "../config"

const webhookSecret = serverConfig.PADDLE_WEBHOOK_SECRET

if (!webhookSecret) {
  throw new Error("PADDLE_WEBHOOK_SECRET is not set!")
}

// export async function validatePaddleWebhook(rawBody: string, signature?: string) {
//   try {
//     const isProd = process.env.NODE_ENV === "production"

//     if (!signature) {
//       if (!isProd) {
//         return JSON.parse(rawBody)
//       }

//       throw new Error("Missing paddle-signature header")
//     }

//     return paddle.webhooks.unmarshal(rawBody, webhookSecret, signature)
//   } catch (error) {
//     throw new Error("Invalid signature or malformed webhook")
//   }
// }

export async function validatePaddleWebhook(rawBody: string, signature?: string) {
  try {
    const isProd = process.env.NODE_ENV === "production"

    if (!signature) {
      if (!isProd) {
        return JSON.parse(rawBody)
      }

      throw new Error("Missing paddle-signature header")
    }

    const parts = signature.match(/^ts=(\d+);h1=(.+)$/)
    if (!parts) throw new Error("Invalid signature format")

    const [_, ts, h1] = parts
    const computed = createHmac("sha256", webhookSecret).update(`${ts}:${rawBody}`).digest("hex")

    if (computed !== h1) {
      throw new Error("Signature mismatch")
    }

    return JSON.parse(rawBody)
  } catch (error) {
    throw new Error("Invalid signature or malformed webhook")
  }
}
