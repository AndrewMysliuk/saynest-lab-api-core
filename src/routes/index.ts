import { Router } from "express"
import whisperRouter from "./whisperRouter"
import textToSpeachRouter from "./textToSpeachRouter"

const router = Router()

router.use("/whisper", whisperRouter)
router.use("/tts", textToSpeachRouter)

export default router
