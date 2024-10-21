import { Router } from "express"
import whisperRouter from "./whisperRouter"
import textToSpeachRouter from "./textToSpeachRouter"
import gptRouter from "./gptRouter"

const router = Router()

router.use("/whisper", whisperRouter)
router.use("/gpt", gptRouter)
router.use("/tts", textToSpeachRouter)

export default router
