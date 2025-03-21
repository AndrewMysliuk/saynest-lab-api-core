import { Router } from "express"
import { HistoryRepository } from "../internal/conversation/storage/mongo/repository"
import { ConversationService } from "../internal/conversation/impl"
import { createConversationRouter } from "../internal/conversation/router"
import { SpeachToTextService } from "../internal/speach_to_text/impl"
import { createSpeachToTextRouter } from "../internal/speach_to_text/router"
import { TextToSpeachService } from "../internal/text_to_speach/impl"
import { createTextToSpeachRouter } from "../internal/text_to_speach/router"
import { TextAnalysisService } from "../internal/text_analysis/impl"
import { createTextAnalysisRouter } from "../internal/text_analysis/router"

// Repositories
const historyRepo = new HistoryRepository()

// Services
const speachToTextService = new SpeachToTextService()
const textToSpeachService = new TextToSpeachService()
const textAnalysisService = new TextAnalysisService()
const conversationService = new ConversationService(historyRepo, speachToTextService, textAnalysisService, textToSpeachService)

const router = Router()

router.use("/whisper", createSpeachToTextRouter(speachToTextService))
router.use("/gpt", createTextAnalysisRouter(textAnalysisService))
router.use("/tts", createTextToSpeachRouter(textToSpeachService))
router.use("/conversation", createConversationRouter(conversationService))

export default router
