import { Router } from "express"

import { superUserOnlyMiddleware } from "../../../middlewares"
import { getWordAudioHandler, getWordExplanationHandler, getWordsListHandler, searchWordsSynonymsHandler } from "../handlers"
import { IVocabularyTracker } from "../index"

const router = Router()

export default router

export const createVocabularyTrackerRouter = (vocabularyTrackerService: IVocabularyTracker): Router => {
  const router = Router()

  router.post("/explanation", getWordExplanationHandler(vocabularyTrackerService))
  router.post("/audio", getWordAudioHandler(vocabularyTrackerService))
  router.post("/search-synonyms", superUserOnlyMiddleware, searchWordsSynonymsHandler(vocabularyTrackerService))
  router.get("/", superUserOnlyMiddleware, getWordsListHandler(vocabularyTrackerService))

  return router
}
