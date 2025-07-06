import { Router } from "express"

import { authMiddleware, createActivityMiddleware, createPaddleMiddleware } from "../../../middlewares"
import { IUserProgressService } from "../../user_progress"
import {
  deleteAllHistoryHandler,
  deleteReviewHandler,
  generateConversationReviewHandler,
  generateReviewPublicIdHandler,
  getReviewByPublicIdHandler,
  getReviewHandler,
  reviewsListHandler,
  updateAudioUrlHandler,
} from "../handlers"
import { ICommunicationReviewService } from "../index"

export const createCommunicationReviewRouter = (communicationReviewService: ICommunicationReviewService, userProgressService: IUserProgressService): Router => {
  const router = Router()

  router.post("/update-audio-url", authMiddleware, createActivityMiddleware(userProgressService), createPaddleMiddleware, updateAudioUrlHandler(communicationReviewService))
  router.post("/", authMiddleware, createActivityMiddleware(userProgressService), createPaddleMiddleware, generateConversationReviewHandler(communicationReviewService, userProgressService))
  router.get("/", authMiddleware, createActivityMiddleware(userProgressService), reviewsListHandler(communicationReviewService))
  router.delete("/all-history", authMiddleware, createActivityMiddleware(userProgressService), deleteAllHistoryHandler(communicationReviewService))
  router.delete("/:id", authMiddleware, createActivityMiddleware(userProgressService), deleteReviewHandler(communicationReviewService))
  router.get("/:id", authMiddleware, createActivityMiddleware(userProgressService), getReviewHandler(communicationReviewService))

  // Public Link
  router.get("/public/:public_id", getReviewByPublicIdHandler(communicationReviewService))
  router.get("/:id/generate-public-id", authMiddleware, createActivityMiddleware(userProgressService), createPaddleMiddleware, generateReviewPublicIdHandler(communicationReviewService))

  return router
}
