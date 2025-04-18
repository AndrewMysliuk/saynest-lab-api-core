import { Request, RequestHandler, Response } from "express"

import { IPromptService } from ".."
import logger from "../../../utils/logger"

export const getPromptsListHandler = (promptService: IPromptService): RequestHandler => {
  return async (_req: Request, res: Response): Promise<void> => {
    try {
      const response = promptService.getPromptList()

      res.status(200).json(response)
    } catch (error: unknown) {
      logger.error(`getTheoryByLanguageHandler | error: ${error}`)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const getPromptByIdHandler = (promptService: IPromptService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const response = promptService.getById(req.params.id)

      res.status(200).json(response)
    } catch (error: unknown) {
      logger.error(`getTheoryByLanguageHandler | error: ${error}`)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}
