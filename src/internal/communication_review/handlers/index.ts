import { Request, RequestHandler, Response } from "express"

import { ICommunicationReviewService } from ".."
import { createScopedLogger } from "../../../utils"
import { IUserProgressService } from "../../user_progress"
import { StatisticsGenerateRequestSchema } from "./validation"

const log = createScopedLogger("CommunicationReviewHandler")

export const generateConversationReviewHandler = (communicationReviewService: ICommunicationReviewService, userProgressService: IUserProgressService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { user_id, organization_id } = req.user!

      const dto = StatisticsGenerateRequestSchema.parse(req.body)

      const response = await communicationReviewService.generateConversationReview(user_id, organization_id, dto)

      await userProgressService.applyReviewStats({
        user_id,
        session_id: dto.session_id,
      })

      res.status(200).json(response)
    } catch (error: unknown) {
      log.error("generateConversationReviewHandler", "error", { error })
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const reviewsListHandler = (communicationReviewService: ICommunicationReviewService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { user_id } = req.user!

      const { from_date, to_date, limit = 20, offset = 0 } = req.query

      const filter = {
        from_date: from_date ? new Date(from_date as string) : undefined,
        to_date: to_date ? new Date(to_date as string) : undefined,
      }

      const pagination = {
        limit: Number(limit),
        offset: Number(offset),
      }

      const response = await communicationReviewService.reviewsList(user_id, filter, pagination)

      res.status(200).json(response)
    } catch (error: unknown) {
      log.error("reviewsListHandler", "error", { error })
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const deleteReviewHandler = (communicationReviewService: ICommunicationReviewService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id
      const { user_id } = req.user!

      if (!id) {
        res.status(400).json({
          error: "deleteReviewHandler | Missing required id field in payload",
        })
        return
      }

      await communicationReviewService.deleteReview(id, user_id)

      res.status(200).json(true)
    } catch (error: unknown) {
      log.error("deleteReviewHandler", "error", { error })
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const deleteAllHistoryHandler = (communicationReviewService: ICommunicationReviewService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { user_id, organization_id } = req.user!

      await communicationReviewService.deleteAllHistoryByUserId(organization_id, user_id)

      res.status(200).json(true)
    } catch (error: unknown) {
      log.error("deleteAllHistoryHandler", "error", { error })
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const getReviewHandler = (communicationReviewService: ICommunicationReviewService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id
      const { user_id } = req.user!

      if (!id) {
        res.status(400).json({
          error: "getReviewHandler | Missing required id field in payload",
        })
        return
      }

      const response = await communicationReviewService.getReview(id, user_id)

      res.status(200).json(response)
    } catch (error: unknown) {
      log.error("getReviewHandler", "error", { error })
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const updateAudioUrlHandler = (communicationReviewService: ICommunicationReviewService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, session_id, pair_id, role } = req.body
      const { user_id } = req.user!

      if (!id || !session_id || !pair_id || !role) {
        res.status(400).json({
          error: "updateAudioUrlHandler | Missing required id field in payload",
        })
        return
      }

      const response = await communicationReviewService.updateAudioUrl({
        id,
        session_id,
        user_id,
        pair_id,
        role,
      })

      res.status(200).json(response)
    } catch (error: unknown) {
      log.error("updateAudioUrlHandler", "error", { error })
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}
