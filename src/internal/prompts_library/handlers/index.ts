import { Request, RequestHandler, Response } from "express"

import { IPromptService } from ".."
import { logger } from "../../../utils"

export const getPromptsListHandler = (promptService: IPromptService): RequestHandler => {
  return async (_req: Request, res: Response): Promise<void> => {
    try {
      const response = promptService.getPromptList()

      res.status(200).json(response)
    } catch (error: unknown) {
      logger.error(`getPromptsListHandler | error: ${error}`)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const getModuleListHandler = (promptService: IPromptService): RequestHandler => {
  return async (_req: Request, res: Response): Promise<void> => {
    try {
      const response = promptService.getModuleList()

      res.status(200).json(response)
    } catch (error: unknown) {
      logger.error(`getModuleListHandler | error: ${error}`)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const getModuleScenariosHandler = (promptService: IPromptService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const response = promptService.getModuleScenarios(req.params.module_id)

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
      logger.error(`getPromptByIdHandler | error: ${error}`)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}
