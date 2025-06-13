import { z } from "zod"

import { SubscriptionTypeEnum } from "../../../../types"

export const createSubscriptionSchema = z.object({
  organization_id: z.string().min(1),
  plan_id: z.string().min(1),
  paddle_subscription_id: z.string().min(1),
  status: z.nativeEnum(SubscriptionTypeEnum),
  trial_dates: z
    .object({
      starts_at: z.string().datetime(),
      ends_at: z.string().datetime(),
    })
    .nullable()
    .optional(),
  start_date: z.string().datetime(),
  next_payment_date: z.string().datetime().nullable(),
  scheduled_cancel_at: z.string().datetime().nullable().optional(),
  is_pending_cancel: z.boolean(),
  canceled_at: z.string().datetime().nullable().optional(),
})
