import { Router } from "express"
import multer from "multer"
import { whisperSpeechToTextHandler } from "../controllers/whisperController"

const upload = multer()
const router = Router()

router.post("/", upload.single("audio"), whisperSpeechToTextHandler)

export default router
