import { Router } from "express"
import whisperRoute from "./whisperRoute"
import textToSpeachRoute from "./textToSpeachRoute"
import gptRoute from "./gptRoute"
import conversationRoute from "./conversationRoute"

const router = Router()

router.use("/whisper", whisperRoute)
router.use("/gpt", gptRoute)
router.use("/tts", textToSpeachRoute)
router.use("/conversation", conversationRoute)

export default router
