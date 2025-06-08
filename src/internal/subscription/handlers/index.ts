import { Request, RequestHandler, Response } from "express"

import { Types } from "mongoose"

import { ISubscriptionService } from ".."
import { createScopedLogger } from "../../../utils"
import { createSubscriptionSchema } from "./validation"

const log = createScopedLogger("SubscriptionHandler")

export const createSubscriptionHandler = (subscriptionService: ISubscriptionService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const parseResult = createSubscriptionSchema.safeParse(req.body)

      if (!parseResult.success) {
        res.status(400).json({ error: "Invalid request", details: parseResult.error.format() })
        return
      }

      const dto = parseResult.data

      const subscriptionData = {
        ...dto,
        organization_id: new Types.ObjectId(dto.organization_id),
        plan_id: new Types.ObjectId(dto.plan_id),
        start_date: new Date(dto.start_date),
        next_payment_date: new Date(dto.next_payment_date),
        canceled_at: dto.canceled_at ? new Date(dto.canceled_at) : undefined,
      }

      const response = await subscriptionService.create(subscriptionData)

      res.status(200).json(response)
    } catch (error: unknown) {
      log.error("createSubscriptionHandler", "error", { error })
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const getByOrgIdHandler = (subscriptionService: ISubscriptionService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const organization_id = req.user?.organization_id as string

      const response = await subscriptionService.getByOrganizationId(organization_id)

      res.status(200).json(response)
    } catch (error: unknown) {
      log.error("getByOrgIdHandler", "error", { error })
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}
