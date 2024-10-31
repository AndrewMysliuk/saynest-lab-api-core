import { Router } from "express"
import multer from "multer"
import { conversationHandler } from "../controllers/conversationController"

const upload = multer()
const router = Router()

router.post("/", upload.single("audio"), conversationHandler)

export default router
