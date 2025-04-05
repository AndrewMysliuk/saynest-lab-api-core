import { Router } from "express"

import { getWordAudioHandler, getWordExplanationHandler, getWordsListHandler } from "../handlers"
import { IVocabularyTracker } from "../index"

const router = Router()

export default router

export const createVocabularyTrackerRouter = (vocabularyTrackerService: IVocabularyTracker): Router => {
  const router = Router()

  router.post("/explanation", getWordExplanationHandler(vocabularyTrackerService))
  router.post("/audio", getWordAudioHandler(vocabularyTrackerService))
  router.get("/", getWordsListHandler(vocabularyTrackerService))

  return router
}
