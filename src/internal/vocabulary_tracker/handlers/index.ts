import { Request, RequestHandler, Response } from "express"

import { IVocabularyTracker } from ".."
import { ISearchSynonymsRequest, IWordExplanationRequest } from "../../../types"
import { logger } from "../../../utils"

export const getWordsListHandler = (vocabularyTrackerService: IVocabularyTracker): RequestHandler => {
  return async (_req: Request, res: Response): Promise<void> => {
    try {
      const response = await vocabularyTrackerService.wordsList()

      res.status(200).json(response)
    } catch (error: unknown) {
      logger.error(`getWordsListHandler | error: ${error}`)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const getWordExplanationHandler = (vocabularyTrackerService: IVocabularyTracker): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = req.body as IWordExplanationRequest
      const { user_id, organization_id } = req.user!

      if (!dto.word || !dto.target_language || !dto.explanation_language) {
        res.status(400).json({
          error: "getWordExplanationHandler | Missing required fields in payload",
        })
        return
      }

      const response = await vocabularyTrackerService.getWordExplanation(user_id, organization_id, dto)

      res.status(200).json(response)
    } catch (error: unknown) {
      logger.error(`getWordExplanationHandler | error: ${error}`)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const getWordAudioHandler = (vocabularyTrackerService: IVocabularyTracker): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = req.body as IWordExplanationRequest

      if (!dto.word || !dto.target_language || !dto.explanation_language) {
        res.status(400).json({
          error: "getWordExplanationHandler | Missing required fields in payload",
        })
        return
      }

      const response = await vocabularyTrackerService.getWordAudio(dto)

      res.status(200).json(response)
    } catch (error: unknown) {
      logger.error(`getWordExplanationHandler | error: ${error}`)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const searchWordsSynonymsHandler = (vocabularyTrackerService: IVocabularyTracker): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = req.body as ISearchSynonymsRequest
      const { user_id, organization_id } = req.user!

      if (!dto.history?.length || !dto.target_language || !dto.explanation_language) {
        res.status(400).json({
          error: "getWordExplanationHandler | Missing required fields in payload",
        })
        return
      }

      const response = await vocabularyTrackerService.searchFillersByHistory(dto)

      res.status(200).json(response)
    } catch (error: unknown) {
      logger.error(`getWordExplanationHandler | error: ${error}`)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}
