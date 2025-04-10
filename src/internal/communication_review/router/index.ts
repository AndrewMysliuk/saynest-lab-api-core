import { Router } from "express"

import { deleteReviewHandler, generateConversationReviewHandler, getReviewHandler, reviewsListHandler } from "../handlers"
import { ICommunicationReviewService } from "../index"

export const createCommunicationReviewRouter = (communicationReviewService: ICommunicationReviewService): Router => {
  const router = Router()

  router.post("/", generateConversationReviewHandler(communicationReviewService))
  router.get("/", reviewsListHandler(communicationReviewService))
  router.get("/:id", getReviewHandler(communicationReviewService))
  router.delete("/:id", deleteReviewHandler(communicationReviewService))

  return router
}
