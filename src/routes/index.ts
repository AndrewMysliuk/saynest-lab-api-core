import { Router } from "express"
import whisperRoutes from "./whisperRouter"

const router = Router()

router.use("/whisper", whisperRoutes)

export default router
