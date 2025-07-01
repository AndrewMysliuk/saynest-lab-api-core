import { Router } from "express"

import { AuthService } from "../internal/auth/impl"
import { createAuthRouter } from "../internal/auth/router"
import { AuthRepository } from "../internal/auth/storage/mongo/repository"
import { CommunicationReviewService } from "../internal/communication_review/impl"
import { createCommunicationReviewRouter } from "../internal/communication_review/router"
import { CommunicationReviewRepository } from "../internal/communication_review/storage/mongo/repository"
import { ConversationService } from "../internal/conversation/impl"
import { createConversationRouter } from "../internal/conversation/router"
import { HistoryRepository } from "../internal/conversation/storage/mongo/repository"
import { ErrorAnalysisService } from "../internal/error_analysis/impl"
import { createErrorAnalysisRouter } from "../internal/error_analysis/router"
import { ErrorAnalysisRepository } from "../internal/error_analysis/storage/mongo/repository"
import { LanguageTheoryService } from "../internal/language_theory/impl"
import { createLanguageTheoryRouter } from "../internal/language_theory/router"
import { OrganisationService } from "../internal/organisation/impl"
import { createOrganisationRouter } from "../internal/organisation/router"
import { OrganisationRepository } from "../internal/organisation/storage/mongo/repository"
import { PlanService } from "../internal/plans/impl"
import { createPlanRouter } from "../internal/plans/router"
import { PlanRepository } from "../internal/plans/storage/mongo/repository"
import { PromptService } from "../internal/prompts_library/impl"
import { createPromptRouter } from "../internal/prompts_library/router"
import { PromptsLibraryRepository } from "../internal/prompts_library/storage/mongo/repository"
import { SessionService } from "../internal/session/impl"
import { createSessionRouter } from "../internal/session/router"
import { SessionRepository } from "../internal/session/storage/mongo/repository"
import { SpeachToTextService } from "../internal/speach_to_text/impl"
import { createSpeachToTextRouter } from "../internal/speach_to_text/router"
import { SubscriptionService } from "../internal/subscription/impl"
import { createSubscriptionRouter } from "../internal/subscription/router"
import { SubscriptionRepository } from "../internal/subscription/storage/mongo/repository"
import { TaskGeneratorService } from "../internal/task_generator/impl"
import { createTaskGeneratorRouter } from "../internal/task_generator/router"
import { TaskGeneratorRepository } from "../internal/task_generator/storage/mongo/repository"
import { TextAnalysisService } from "../internal/text_analysis/impl"
import { createTextAnalysisRouter } from "../internal/text_analysis/router"
import { TextToSpeachService } from "../internal/text_to_speach/impl"
import { createTextToSpeachRouter } from "../internal/text_to_speach/router"
import { UserService } from "../internal/user/impl"
import { createUserRouter } from "../internal/user/router"
import { UserRepository } from "../internal/user/storage/mongo/repository"
import { UserProgressService } from "../internal/user_progress/impl"
import { createUserProgressRouter } from "../internal/user_progress/router"
import { UserProgressRepository } from "../internal/user_progress/storage/mongo/repository"
import { VocabularyService } from "../internal/vocabulary/impl"
import { createVocabularyRouter } from "../internal/vocabulary/router"
import { VocabularyRepository } from "../internal/vocabulary/storage/mongo/repository"
import { authMiddleware, createActivityMiddleware, createPaddleMiddleware, superUserOnlyMiddleware } from "../middlewares"

// Repositories
const organisationRepo = new OrganisationRepository()
const userRepo = new UserRepository()
const userProgressRepo = new UserProgressRepository()
const authRepo = new AuthRepository()
const sessionRepo = new SessionRepository()
const vocabularyRepo = new VocabularyRepository()
const errorAnalysisRepository = new ErrorAnalysisRepository()
const historyRepo = new HistoryRepository()
const communicationReviewRepo = new CommunicationReviewRepository()
const taskGeneratorRepo = new TaskGeneratorRepository()
const promptsLibraryRepository = new PromptsLibraryRepository()
const planRepository = new PlanRepository()
const subscriptionRepository = new SubscriptionRepository()

// Services
const organisationService = new OrganisationService(organisationRepo)
const userService = new UserService(userRepo)
const promptService = new PromptService(promptsLibraryRepository)
const sessionService = new SessionService(sessionRepo, historyRepo, promptService)
const languageTheoryService = new LanguageTheoryService()
const speachToTextService = new SpeachToTextService()
const textToSpeachService = new TextToSpeachService()
const textAnalysisService = new TextAnalysisService()
const vocabularyService = new VocabularyService(vocabularyRepo, textToSpeachService)
const errorAnalysisService = new ErrorAnalysisService(errorAnalysisRepository, languageTheoryService, promptService)
const conversationService = new ConversationService(historyRepo, sessionService, speachToTextService, textAnalysisService, textToSpeachService)
const communicationReviewService = new CommunicationReviewService(communicationReviewRepo, errorAnalysisService, conversationService, sessionService, promptService)
const userProgressService = new UserProgressService(userProgressRepo, sessionService, communicationReviewService, promptService)
const authService = new AuthService(authRepo, userService, organisationService, userProgressService)
const taskGeneratorService = new TaskGeneratorService(taskGeneratorRepo, communicationReviewService, promptService)
const planService = new PlanService(planRepository)
const subscriptionService = new SubscriptionService(subscriptionRepository, organisationService, planService)

const apiRouter = Router()

apiRouter.use("/auth", createAuthRouter(authService))
apiRouter.use("/user", authMiddleware, createActivityMiddleware(userProgressService), createUserRouter(userService))
apiRouter.use("/org", authMiddleware, createActivityMiddleware(userProgressService), createOrganisationRouter(organisationService))
apiRouter.use("/user-progress", authMiddleware, createUserProgressRouter(userProgressService))
apiRouter.use("/session", authMiddleware, createPaddleMiddleware, createActivityMiddleware(userProgressService), createSessionRouter(sessionService))
apiRouter.use("/language-theory", authMiddleware, createPaddleMiddleware, superUserOnlyMiddleware, createActivityMiddleware(userProgressService), createLanguageTheoryRouter(languageTheoryService))
apiRouter.use("/vocabulary", authMiddleware, createActivityMiddleware(userProgressService), createVocabularyRouter(vocabularyService))
apiRouter.use("/task-generator", authMiddleware, createPaddleMiddleware, createActivityMiddleware(userProgressService), createTaskGeneratorRouter(taskGeneratorService, userProgressService))
apiRouter.use("/error-analysis", authMiddleware, createPaddleMiddleware, createActivityMiddleware(userProgressService), createErrorAnalysisRouter(errorAnalysisService))
apiRouter.use("/speach-to-text", authMiddleware, createPaddleMiddleware, superUserOnlyMiddleware, createActivityMiddleware(userProgressService), createSpeachToTextRouter(speachToTextService))
apiRouter.use("/text-analysis", authMiddleware, createPaddleMiddleware, superUserOnlyMiddleware, createActivityMiddleware(userProgressService), createTextAnalysisRouter(textAnalysisService))
apiRouter.use("/text-to-speach", authMiddleware, createPaddleMiddleware, superUserOnlyMiddleware, createActivityMiddleware(userProgressService), createTextToSpeachRouter(textToSpeachService))
apiRouter.use("/conversation", authMiddleware, createPaddleMiddleware, createActivityMiddleware(userProgressService), createConversationRouter(conversationService))
apiRouter.use("/communication-review", authMiddleware, createActivityMiddleware(userProgressService), createCommunicationReviewRouter(communicationReviewService, userProgressService))
apiRouter.use("/prompts-library", authMiddleware, createActivityMiddleware(userProgressService), createPromptRouter(promptService))
apiRouter.use("/plan", authMiddleware, createPlanRouter(planService))
apiRouter.use("/subscription", authMiddleware, createSubscriptionRouter(subscriptionService))

export default apiRouter
