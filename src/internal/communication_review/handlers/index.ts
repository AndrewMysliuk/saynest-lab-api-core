import { Request, RequestHandler, Response } from "express"

import { ICommunicationReviewService } from ".."
import logger from "../../../utils/logger"
import { StatisticsGenerateRequestSchema } from "./validation"

export const generateConversationReviewHandler = (communicationReviewService: ICommunicationReviewService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { user_id, organization_id } = req.user!

      const dto = StatisticsGenerateRequestSchema.parse(req.body)

      const response = await communicationReviewService.generateConversationReview(user_id, organization_id, dto)

      res.status(200).json(response)
    } catch (error: unknown) {
      logger.error(`generateConversationReviewHandler | error: ${error}`)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const reviewsListHandler = (communicationReviewService: ICommunicationReviewService): RequestHandler => {
  return async (_req: Request, res: Response): Promise<void> => {
    try {
      const response = await communicationReviewService.reviewsList()

      res.status(200).json(response)
    } catch (error: unknown) {
      logger.error(`reviewsListHandler | error: ${error}`)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const deleteReviewHandler = (communicationReviewService: ICommunicationReviewService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id

      if (!id) {
        res.status(400).json({
          error: "deleteReviewHandler | Missing required id field in payload",
        })
        return
      }

      await communicationReviewService.deleteReview(id)

      res.status(200).json(true)
    } catch (error: unknown) {
      logger.error(`deleteReviewHandler | error: ${error}`)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const getReviewHandler = (communicationReviewService: ICommunicationReviewService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id

      if (!id) {
        res.status(400).json({
          error: "getReviewHandler | Missing required id field in payload",
        })
        return
      }

      const response = await communicationReviewService.getReview(id)

      res.status(200).json(response)
    } catch (error: unknown) {
      logger.error(`getReviewHandler | error: ${error}`)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}
