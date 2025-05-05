import { Router } from "express"

import { deleteReviewHandler, generateConversationReviewHandler, getReviewHandler, reviewsListHandler, updateAudioUrlHandler } from "../handlers"
import { ICommunicationReviewService } from "../index"

export const createCommunicationReviewRouter = (communicationReviewService: ICommunicationReviewService): Router => {
  const router = Router()

  router.post("/update-audio-url", updateAudioUrlHandler(communicationReviewService))
  router.post("/", generateConversationReviewHandler(communicationReviewService))
  router.get("/", reviewsListHandler(communicationReviewService))
  router.get("/:id", getReviewHandler(communicationReviewService))
  router.delete("/:id", deleteReviewHandler(communicationReviewService))

  return router
}
