import { Router } from "express"
import multer from "multer"
import { createConversationHandler } from "../handlers"
import { IConversationService } from "../index"

const upload = multer()

export const createConversationRouter = (conversationService: IConversationService): Router => {
  const router = Router()

  router.post("/", upload.single("audio"), createConversationHandler(conversationService))

  return router
}
