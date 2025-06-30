import { Router } from "express"

import { addWordToUserHandler, deleteUserWordHandler, generateWordAudioUrlHandler, listUserWordsHandler, lookupWordHandler, updateUserWordTierHandler } from "../handlers"
import { IVocabulary } from "../index"

const router = Router()

export default router

export const createVocabularyRouter = (vocabularyService: IVocabulary): Router => {
  const router = Router()

  router.get("/lookup", lookupWordHandler(vocabularyService))
  router.get("/audio/:global_word_id", generateWordAudioUrlHandler(vocabularyService))
  router.post("/add", addWordToUserHandler(vocabularyService))
  router.patch("/update-tier", updateUserWordTierHandler(vocabularyService))
  router.delete("/user-word/delete/:id", deleteUserWordHandler(vocabularyService))
  router.get("/list", listUserWordsHandler(vocabularyService))

  return router
}
