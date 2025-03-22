import { Router } from "express"

import { ConversationService } from "../internal/conversation/impl"
import { createConversationRouter } from "../internal/conversation/router"
import { HistoryRepository } from "../internal/conversation/storage/mongo/repository"
import { ErrorAnalysisService } from "../internal/error_analysis/impl"
import { createErrorAnalysisRouter } from "../internal/error_analysis/router"
import { SpeachToTextService } from "../internal/speach_to_text/impl"
import { createSpeachToTextRouter } from "../internal/speach_to_text/router"
import { TextAnalysisService } from "../internal/text_analysis/impl"
import { createTextAnalysisRouter } from "../internal/text_analysis/router"
import { TextToSpeachService } from "../internal/text_to_speach/impl"
import { createTextToSpeachRouter } from "../internal/text_to_speach/router"

// Repositories
const historyRepo = new HistoryRepository()

// Services
const speachToTextService = new SpeachToTextService()
const textToSpeachService = new TextToSpeachService()
const textAnalysisService = new TextAnalysisService()
const errorAnalysisService = new ErrorAnalysisService()
const conversationService = new ConversationService(historyRepo, speachToTextService, textAnalysisService, textToSpeachService)

const router = Router()

router.use("/error-analysis", createErrorAnalysisRouter(errorAnalysisService))
router.use("/speach-to-text", createSpeachToTextRouter(speachToTextService))
router.use("/text-analysis", createTextAnalysisRouter(textAnalysisService))
router.use("/text-to-speach", createTextToSpeachRouter(textToSpeachService))
router.use("/conversation", createConversationRouter(conversationService))

export default router
