import { Types } from "mongoose"

import { ISubscriptionService } from ".."
import { activateSubscription, cancelSubscription, changePlanSubscription, getSubscription, recancelSubscription } from "../../../config"
import { IMongooseOptions, ISubscriptionChangePlanRequest, ISubscriptionEntity, SubscriptionTypeEnum, normalizeStatus } from "../../../types"
import { createScopedLogger } from "../../../utils"
import { IOrganisationService } from "../../organisation"
import { IPlanService } from "../../plans"
import { IRepository } from "../storage"

const log = createScopedLogger("SubscriptionService")

export class SubscriptionService implements ISubscriptionService {
  private readonly subscriptionRepo: IRepository
  private readonly orgService: IOrganisationService
  private readonly planService: IPlanService

  constructor(subscriptionRepo: IRepository, orgService: IOrganisationService, planService: IPlanService) {
    this.subscriptionRepo = subscriptionRepo
    this.orgService = orgService
    this.planService = planService
  }

  async create(data: Partial<ISubscriptionEntity>, options?: IMongooseOptions): Promise<ISubscriptionEntity> {
    try {
      const sub = await this.subscriptionRepo.create(data, options)

      return sub
    } catch (error: unknown) {
      log.error("create", "error", { error })
      throw error
    }
  }

  async getByOrganizationId(organization_id: string, options?: IMongooseOptions): Promise<ISubscriptionEntity | null> {
    try {
      const sub = await this.subscriptionRepo.getByOrganizationId(organization_id, options)

      return sub
    } catch (error: unknown) {
      log.error("getByOrganizationId", "error", { error })
      throw error
    }
  }

  async createSubscription(paddle_subscription_id: string, options?: IMongooseOptions): Promise<ISubscriptionEntity | null> {
    try {
      const paddleSub = await getSubscription(paddle_subscription_id)

      const paddleStatus = normalizeStatus(paddleSub.status) ?? SubscriptionTypeEnum.TRIALING
      const priceId = paddleSub.items?.[0]?.price?.id
      const nextBilledAt = paddleSub?.nextBilledAt ?? ""
      const createdAt = paddleSub.createdAt
      const trialDatesRaw = paddleSub.items?.[0]?.trialDates

      const trialDates = trialDatesRaw
        ? {
            starts_at: new Date(trialDatesRaw.startsAt),
            ends_at: new Date(trialDatesRaw.endsAt),
          }
        : null

      const custom = paddleSub.customData as { user_id: string; organization_id: string; plan_id: string }
      if (!custom) {
        log.info("createSubscription", "customData is missing", {
          paddle_subscription_id,
        })
        return null
      }

      const userId = custom.user_id
      const orgId = custom.organization_id
      const planId = custom.plan_id

      if (!userId || !orgId || !priceId || !planId) {
        log.info("createSubscription", "Missing required subscription data", {
          paddle_subscription_id,
        })
        return null
      }

      const existingSub = await this.subscriptionRepo.getByOrganizationId(orgId, options)

      if (existingSub) {
        log.info("createSubscription", "Updating existing subscription instead of creating new", {
          existing_status: existingSub.status,
          new_status: paddleStatus,
        })

        const updated = await this.subscriptionRepo.update(
          existingSub._id.toString(),
          {
            paddle_subscription_id,
            plan_id: new Types.ObjectId(planId),
            status: paddleStatus,
            start_date: new Date(createdAt),
            next_payment_date: new Date(nextBilledAt),
            trial_dates: trialDates,
            canceled_at: null,
            scheduled_cancel_at: null,
            is_pending_cancel: false,
          },
          options,
        )

        return updated
      }

      const newSub = await this.subscriptionRepo.create(
        {
          organization_id: new Types.ObjectId(orgId),
          plan_id: new Types.ObjectId(planId),
          paddle_subscription_id,
          status: paddleStatus,
          start_date: new Date(createdAt),
          next_payment_date: new Date(nextBilledAt),
          trial_dates: trialDates,
          is_pending_cancel: false,
        },
        options,
      )

      await this.orgService.update(orgId, { subscription_id: newSub._id }, options)
      return newSub
    } catch (error: unknown) {
      log.error("startSubscription", "error", { error })
      throw error
    }
  }

  async cancelSubscription(organization_id: string, options?: IMongooseOptions): Promise<ISubscriptionEntity | null> {
    try {
      const sub = await this.subscriptionRepo.getByOrganizationId(organization_id, options)
      if (!sub) {
        throw new Error(`active subscription not found for org: ${organization_id}`)
      }

      if (![SubscriptionTypeEnum.ACTIVE, SubscriptionTypeEnum.TRIALING, SubscriptionTypeEnum.PAST_DUE].includes(sub.status)) {
        throw new Error(`Cannot cancel subscription in status: ${sub.status}`)
      }

      const result = await cancelSubscription(sub.paddle_subscription_id)

      const scheduledCancel = result.scheduledChange?.action === "cancel"
      const scheduledCancelAt = result.scheduledChange?.effectiveAt
      const nextPayment = result.nextBilledAt
      const trial = result.items?.[0]?.trialDates ?? null

      const updatedSub = await this.subscriptionRepo.update(
        sub._id.toString(),
        {
          next_payment_date: nextPayment ? new Date(nextPayment) : sub.next_payment_date,
          is_pending_cancel: scheduledCancel,
          scheduled_cancel_at: scheduledCancelAt ? new Date(scheduledCancelAt) : null,
          trial_dates: trial
            ? {
                starts_at: new Date(trial.startsAt),
                ends_at: new Date(trial.endsAt),
              }
            : sub.trial_dates,
        },
        options,
      )

      log.info("cancelSubscription", "Subscription canceled and updated", {
        id: sub._id.toString(),
        organization_id,
        scheduled_cancel_at: scheduledCancelAt,
      })

      return updatedSub
    } catch (error: unknown) {
      log.error("cancelSubscription", "error", { error })
      throw error
    }
  }

  async recancelSubscription(organization_id: string, options?: IMongooseOptions): Promise<ISubscriptionEntity | null> {
    try {
      const sub = await this.subscriptionRepo.getByOrganizationId(organization_id, options)
      if (!sub) {
        throw new Error(`active subscription not found for org: ${organization_id}`)
      }

      if (![SubscriptionTypeEnum.ACTIVE, SubscriptionTypeEnum.TRIALING, SubscriptionTypeEnum.PAST_DUE].includes(sub.status)) {
        throw new Error(`Cannot recancel subscription in status: ${sub.status}`)
      }

      const result = await recancelSubscription(sub.paddle_subscription_id)

      const scheduledCancel = result.scheduledChange?.action === "cancel"
      const scheduledCancelAt = result.scheduledChange?.effectiveAt
      const nextPayment = result.nextBilledAt
      const trial = result.items?.[0]?.trialDates ?? null

      const updatedSub = await this.subscriptionRepo.update(
        sub._id.toString(),
        {
          next_payment_date: nextPayment ? new Date(nextPayment) : sub.next_payment_date,
          is_pending_cancel: scheduledCancel,
          scheduled_cancel_at: scheduledCancelAt ? new Date(scheduledCancelAt) : null,
          trial_dates: trial
            ? {
                starts_at: new Date(trial.startsAt),
                ends_at: new Date(trial.endsAt),
              }
            : sub.trial_dates,
        },
        options,
      )

      return updatedSub
    } catch (error: unknown) {
      log.error("recancelSubscription", "error", { error })
      throw error
    }
  }

  async activateFromTrialSubscription(organization_id: string, options?: IMongooseOptions): Promise<ISubscriptionEntity | null> {
    try {
      const sub = await this.subscriptionRepo.getByOrganizationId(organization_id, options)
      if (!sub) {
        throw new Error(`active subscription not found for org: ${organization_id}`)
      }

      if (![SubscriptionTypeEnum.TRIALING].includes(sub.status)) {
        throw new Error(`Cannot activate subscription in status: ${sub.status}`)
      }

      const result = await activateSubscription(sub.paddle_subscription_id)

      const currentPeriodStart = result.currentBillingPeriod?.startsAt
      const nextBilledAt = result.nextBilledAt

      if (!currentPeriodStart || !nextBilledAt) {
        throw new Error(`Missing billing dates in Paddle response`)
      }

      const updatedSub = await this.subscriptionRepo.update(
        sub._id.toString(),
        {
          status: SubscriptionTypeEnum.ACTIVE,
          start_date: new Date(result.currentBillingPeriod.startsAt),
          next_payment_date: new Date(result.nextBilledAt),
          is_pending_cancel: false,
          scheduled_cancel_at: null,
          trial_dates: result.items?.[0]?.trialDates
            ? {
                starts_at: new Date(result.items[0].trialDates.startsAt),
                ends_at: new Date(result.items[0].trialDates.endsAt),
              }
            : null,
        },
        options,
      )

      return updatedSub
    } catch (error: unknown) {
      log.error("activateFromTrialSubscription", "error", { error })
      throw error
    }
  }

  async cancelledSubscription(paddle_subscription_id: string, options?: IMongooseOptions): Promise<ISubscriptionEntity | null> {
    try {
      const sub = await this.subscriptionRepo.getByPaddleSubscriptionId(paddle_subscription_id, options)
      if (!sub) {
        log.info("cancelledSubscription", "subscription not found", {
          paddle_subscription_id,
        })
        return null
      }

      const updated = await this.subscriptionRepo.update(
        sub._id.toString(),
        {
          status: SubscriptionTypeEnum.CANCELLED,
          canceled_at: new Date(),
          is_pending_cancel: false,
          scheduled_cancel_at: null,
        },
        options,
      )

      return updated
    } catch (error: unknown) {
      log.error("cancelledSubscription", "error", { error })
      throw error
    }
  }

  async pastDueSubscription(paddle_subscription_id: string, options?: IMongooseOptions): Promise<ISubscriptionEntity | null> {
    try {
      const sub = await this.subscriptionRepo.getByPaddleSubscriptionId(paddle_subscription_id, options)
      if (!sub) {
        log.info("pastDueSubscription", "subscription not found", {
          paddle_subscription_id,
        })
        return null
      }

      const updated = await this.subscriptionRepo.update(
        sub._id.toString(),
        {
          status: SubscriptionTypeEnum.PAST_DUE,
          canceled_at: null,
          is_pending_cancel: false,
          scheduled_cancel_at: null,
        },
        options,
      )

      return updated
    } catch (error: unknown) {
      log.error("pastDueSubscription", "error", { error })
      throw error
    }
  }

  async getPaymentDetailsLink(organization_id: string, options?: IMongooseOptions): Promise<string> {
    try {
      const sub = await this.subscriptionRepo.getByOrganizationId(organization_id, options)
      if (!sub) {
        throw new Error(`active subscription not found for org: ${organization_id}`)
      }

      if (![SubscriptionTypeEnum.PAST_DUE].includes(sub.status)) {
        throw new Error(`Cannot send link cause subscription in status: ${sub.status}`)
      }

      const result = await getSubscription(sub.paddle_subscription_id)
      const url = result.managementUrls?.updatePaymentMethod

      if (!url) {
        throw new Error("Update payment method link is not available")
      }

      return url
    } catch (error: unknown) {
      log.error("getPaymentDetailsLink", "error", { error })
      throw error
    }
  }

  async updateSubscription(paddle_subscription_id: string, options?: IMongooseOptions): Promise<ISubscriptionEntity | null> {
    try {
      const sub = await this.subscriptionRepo.getByPaddleSubscriptionId(paddle_subscription_id, options)
      if (!sub) {
        log.info("updateSubscription", "subscription not found", {
          paddle_subscription_id,
        })
        return null
      }

      const p = await getSubscription(paddle_subscription_id)
      const updates: Partial<ISubscriptionEntity> = {}

      if (["canceled"].includes(p.status)) {
        return null
      }

      if (p.scheduledChange?.action === "cancel") {
        return null
      }

      const normalizedStatus = normalizeStatus(p.status)

      if (normalizedStatus && normalizedStatus !== sub.status && normalizedStatus === SubscriptionTypeEnum.ACTIVE && sub.status === SubscriptionTypeEnum.PAST_DUE) {
        updates.status = SubscriptionTypeEnum.ACTIVE
      }

      if (normalizedStatus && normalizedStatus !== sub.status && normalizedStatus === SubscriptionTypeEnum.ACTIVE && sub.status === SubscriptionTypeEnum.TRIALING) {
        updates.status = SubscriptionTypeEnum.ACTIVE
      }

      if (p.nextBilledAt && (!sub.next_payment_date || new Date(p.nextBilledAt).getTime() !== sub.next_payment_date.getTime())) {
        updates.next_payment_date = new Date(p.nextBilledAt)
      }

      if (!p.scheduledChange && sub.is_pending_cancel) {
        updates.is_pending_cancel = false
        updates.scheduled_cancel_at = null
      }

      const trial = p.items?.[0]?.trialDates
      if (
        trial?.startsAt &&
        trial?.endsAt &&
        (!sub.trial_dates || new Date(trial.startsAt).getTime() !== sub.trial_dates.starts_at.getTime() || new Date(trial.endsAt).getTime() !== sub.trial_dates.ends_at.getTime())
      ) {
        updates.trial_dates = {
          starts_at: new Date(trial.startsAt),
          ends_at: new Date(trial.endsAt),
        }
      }

      if (Object.keys(updates).length === 0) {
        return null
      }

      log.info("updateSubscription", "Applying updates to subscription", {
        subscription_id: sub._id.toString(),
        updates,
      })

      const updated = await this.subscriptionRepo.update(sub._id.toString(), updates, options)
      return updated
    } catch (error: unknown) {
      log.error("updateSubscription", "error", { error })
      throw error
    }
  }

  async changePlanSubscription(dto: ISubscriptionChangePlanRequest, options?: IMongooseOptions): Promise<ISubscriptionEntity | null> {
    try {
      const sub = await this.subscriptionRepo.getByOrganizationId(dto.organization_id, options)
      if (!sub) {
        throw new Error(`subscription not found for org: ${dto.organization_id}`)
      }

      if (![SubscriptionTypeEnum.ACTIVE, SubscriptionTypeEnum.TRIALING, SubscriptionTypeEnum.PAST_DUE].includes(sub.status)) {
        throw new Error(`invalid status: ${sub.status}`)
      }

      const plan = await this.planService.getById(dto.plan_id, options)
      if (!plan) {
        throw new Error(`invalid plan id: ${dto.plan_id}`)
      }

      const priceId = plan.paddle_price_ids.no_trial

      const result = await changePlanSubscription(sub.paddle_subscription_id, priceId)

      if (!result.nextBilledAt) {
        throw new Error("not found nextBilledAt")
      }

      const updates: Partial<ISubscriptionEntity> = {
        plan_id: plan._id,
        next_payment_date: new Date(result.nextBilledAt),
      }

      if ([SubscriptionTypeEnum.TRIALING].includes(sub.status)) {
        updates.status = SubscriptionTypeEnum.ACTIVE
      }

      const updatedSub = await this.subscriptionRepo.update(sub._id.toString(), updates, options)

      return updatedSub
    } catch (error: unknown) {
      log.error("changePlanSubscription", "error", { error })
      throw error
    }
  }
}
