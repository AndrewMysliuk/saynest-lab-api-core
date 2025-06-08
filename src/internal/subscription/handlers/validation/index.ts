import { z } from "zod"

import { SubscriptionTypeEnum } from "../../../../types"

export const createSubscriptionSchema = z.object({
  organization_id: z.string().min(1),
  plan_id: z.string().min(1),
  paddle_subscription_id: z.string().min(1),
  status: z.nativeEnum(SubscriptionTypeEnum),
  start_date: z.string().datetime(),
  next_payment_date: z.string().datetime(),
  canceled_at: z.string().datetime().optional(),
})
