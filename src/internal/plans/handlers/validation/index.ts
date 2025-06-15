import { z } from "zod"

import { PlanBillingPeriodEnum, PlanNameEnum, PlanStatusEnum } from "../../../../types"

export const createPlanSchema = z.object({
  name: z.nativeEnum(PlanNameEnum),
  description: z.string().min(1),
  features: z.array(z.string()).default([]),

  paddle_price_ids: z.object({
    trial: z.string().min(1),
    no_trial: z.string().min(1),
  }),

  currency: z.string().length(3),
  amount: z.number().nonnegative(),
  is_public: z.boolean(),
  status: z.nativeEnum(PlanStatusEnum),
  billing_period: z.nativeEnum(PlanBillingPeriodEnum),

  trial_info: z
    .object({
      period_days: z.number().nonnegative().default(0),
      session_count_limit: z.number().nonnegative().default(0),
      review_count_limit: z.number().nonnegative().default(0),
      task_count_limit: z.number().nonnegative().default(0),
    })
    .default({
      period_days: 0,
      session_count_limit: 0,
      review_count_limit: 0,
      task_count_limit: 0,
    }),
})
