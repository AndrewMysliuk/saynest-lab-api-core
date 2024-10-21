import { Router } from "express"
import { gptConversationHandler } from "../controllers/gptController"

const router = Router()

router.post("/", gptConversationHandler)

export default router
