import { Request, RequestHandler, Response } from "express"

import { IVocabulary } from ".."
import { createScopedLogger } from "../../../utils"

const log = createScopedLogger("VocabularyTrackerHandler")

export const lookupWordHandler = (vocabularyService: IVocabulary): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { user_id } = req.user!

      const { word, target_language, native_language } = req.query

      if (!word || !target_language || !native_language) {
        res.status(400).json({ error: "Missing required query params" })
        return
      }

      const response = await vocabularyService.lookupWord({
        word: word.toString(),
        target_language: target_language.toString(),
        native_language: native_language.toString(),
        user_id,
      })

      res.status(200).json(response)
    } catch (error: unknown) {
      log.error("lookupWordHandler", "error", { error })
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const generateWordAudioUrlHandler = (vocabularyService: IVocabulary): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { global_word_id } = req.params

      if (!global_word_id) {
        res.status(400).json({ error: "Missing global_word_id" })
        return
      }

      const url = await vocabularyService.generateWordAudioUrl(global_word_id.toString())
      res.status(200).json({ audio_url: url })
    } catch (error: unknown) {
      log.error("generateWordAudioUrlHandler", "error", { error })
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const addWordToUserHandler = (vocabularyService: IVocabulary): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { user_id } = req.user!

      const { global_word_id, tier } = req.body

      if (!user_id || !global_word_id || !tier) {
        res.status(400).json({ error: "Missing required fields" })
        return
      }

      const response = await vocabularyService.addWordToUser(user_id, global_word_id, tier)
      res.status(200).json(response)
    } catch (error: unknown) {
      log.error("addWordToUserHandler", "error", { error })
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const updateUserWordTierHandler = (vocabularyService: IVocabulary): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { user_word_id, tier } = req.body

      if (!user_word_id || !tier) {
        res.status(400).json({ error: "Missing user_word_id or tier" })
        return
      }

      const response = await vocabularyService.updateUserWordTier(user_word_id, tier)
      res.status(200).json(response)
    } catch (error: unknown) {
      log.error("updateUserWordTierHandler", "error", { error })
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const deleteUserWordHandler = (vocabularyService: IVocabulary): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { user_id } = req.user!

      const { id: global_word_id } = req.params

      if (!user_id || !global_word_id) {
        res.status(400).json({ error: "Missing user_id or global_word_id" })
        return
      }

      await vocabularyService.deleteUserWord(user_id, global_word_id.toString())

      res.status(204).json(true)
    } catch (error: unknown) {
      log.error("deleteUserWordHandler", "error", { error })
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const listUserWordsHandler = (vocabularyService: IVocabulary): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { user_id } = req.user!

      const { target_language, native_language, limit = 20, offset = 0 } = req.query

      if (!user_id) {
        res.status(400).json({ error: "Missing user_id" })
        return
      }

      const filters = {
        target_language: target_language?.toString(),
        native_language: native_language?.toString(),
      }

      const pagination = {
        limit: Number(limit),
        offset: Number(offset),
      }

      const response = await vocabularyService.listUserWords(user_id, filters, pagination)
      res.status(200).json(response)
    } catch (error: unknown) {
      log.error("listUserWordsHandler", "error", { error })
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}
