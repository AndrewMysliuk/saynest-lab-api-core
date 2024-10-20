import { Router } from "express"
import { ttsTextToSpeachHandler } from "../controllers/textToSpeachController"

const router = Router()

router.post("/", ttsTextToSpeachHandler)

export default router
