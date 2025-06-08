import { NextFunction, Request, Response } from "express"

import { OrganizationModel } from "../internal/organisation/storage/mongo/model"
import { PlanModel } from "../internal/plans/storage/mongo/model"
import { SubscriptionModel } from "../internal/subscription/storage/mongo/model"
import { IOrganizationTrialUsage, SubscriptionTypeEnum } from "../types"
import { createScopedLogger } from "../utils"

const log = createScopedLogger("PaddleMiddleware")

export const SUBSCRIPTION_INACTIVE = "PADDLE.SUBSCRIPTION_INACTIVE"
export const INTERNAL_ERROR = "PADDLE.INTERNAL_ERROR"
export const TRIAL_SESSION_COUNT_EXPIRED = "ORG.TRIAL_SESSION_COUNT_EXPIRED"
export const TRIAL_REVIEW_COUNT_EXPIRED = "ORG.TRIAL_REVIEW_COUNT_EXPIRED"
export const TRIAL_TASK_COUNT_EXPIRED = "ORG.TRIAL_TASK_COUNT_EXPIRED"

const TRIAL_USAGE_ENDPOINTS: { method: string; path: RegExp; counter: keyof IOrganizationTrialUsage }[] = [
  { method: "POST", path: /^\/api\/session\/?$/, counter: "session_count" },
  { method: "POST", path: /^\/api\/communication-review\/?$/, counter: "review_count" },
  { method: "POST", path: /^\/api\/task-generator\/?$/, counter: "task_count" },
  { method: "PATCH", path: /^\/api\/task-generator\/[^/]+\/completed$/, counter: "task_count" },
]

export async function createPaddleMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const method = "createPaddleMiddleware"

  try {
    const organization_id = req.user!.organization_id
    const subscription = await SubscriptionModel.findOne({ organization_id })

    if (!subscription || ![SubscriptionTypeEnum.ACTIVE, SubscriptionTypeEnum.TRIALING].includes(subscription.status)) {
      log.warn(method, "Inactive or missing subscription", { orgId: organization_id })
      res.status(403).json({
        code: SUBSCRIPTION_INACTIVE,
        message: "Your subscription is inactive or expired. Please renew to continue.",
      })
      return
    }

    if (subscription.status === SubscriptionTypeEnum.TRIALING) {
      const organization = await getOrganization(organization_id)
      const plan = await getPlan(subscription.plan_id.toString())
      const trialUsage = organization.trial_usage
      const trialOk = await checkTrialLimits(trialUsage, plan.trial_info, req, res)
      if (!trialOk) return

      await incrementTrialUsageIfNeeded(organization_id, trialUsage, req)
    }

    next()
  } catch (error: unknown) {
    log.error("createPaddleMiddleware", "Failed to validate subscription", { error })
    res.status(500).json({
      code: INTERNAL_ERROR,
      message: "An internal error occurred. Please try again later.",
    })
  }
}

async function getOrganization(organization_id: string) {
  const organization = await OrganizationModel.findById(organization_id).lean().exec()
  if (!organization) {
    throw new Error("Organization not found.")
  }
  return organization
}

async function getPlan(plan_id: string) {
  const plan = await PlanModel.findById(plan_id).lean().exec()
  if (!plan) {
    throw new Error("Plan not found.")
  }
  return plan
}

async function checkTrialLimits(trialUsage: IOrganizationTrialUsage, planTrialInfo: any, req: Request, res: Response) {
  const endpoint = TRIAL_USAGE_ENDPOINTS.find((e) => e.method === req.method && e.path.test(req.originalUrl))

  if (!endpoint) return true

  const limitKey = (endpoint.counter + "_limit") as keyof typeof planTrialInfo
  const usageKey = endpoint.counter as keyof IOrganizationTrialUsage

  if (trialUsage[usageKey] >= planTrialInfo[limitKey]) {
    const errorCode = {
      session_count: TRIAL_SESSION_COUNT_EXPIRED,
      review_count: TRIAL_REVIEW_COUNT_EXPIRED,
      task_count: TRIAL_TASK_COUNT_EXPIRED,
    }[usageKey]

    res.status(403).json({
      code: errorCode,
      message: "You have reached the trial limit. Upgrade to continue.",
    })
    return false
  }

  return true
}

async function incrementTrialUsageIfNeeded(organization_id: string, trialUsage: IOrganizationTrialUsage, req: Request) {
  const endpoint = TRIAL_USAGE_ENDPOINTS.find((e) => e.method === req.method && e.path.test(req.originalUrl))
  if (!endpoint) return

  const usageKey = endpoint.counter as keyof IOrganizationTrialUsage

  await OrganizationModel.findByIdAndUpdate(organization_id, {
    $set: {
      [`trial_usage.${usageKey}`]: trialUsage[usageKey] + 1,
    },
  }).exec()
}
