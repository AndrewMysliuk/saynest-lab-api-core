import { Request, RequestHandler, Response } from "express"

import { ISessionService } from ".."
import { SessionTypeEnum } from "../../../types"
import logger from "../../../utils/logger"

export const createSessionHandler = (sessionService: ISessionService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { type, system_prompt }: { type: SessionTypeEnum; system_prompt: string } = req.body

      if (!type) {
        res.status(400).json({
          error: "createSessionHandler | Missing required fields in payload",
        })
        return
      }

      const response = await sessionService.createSession(system_prompt, type)

      res.status(200).json(response)
    } catch (error: unknown) {
      logger.error(`errorAnalysisHandler | error: ${error}`)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const getSessionHandler = (sessionService: ISessionService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const session_id = req.params.session_id

      if (!session_id) {
        res.status(400).json({
          error: "getSessionHandler | Missing required fields in payload",
        })
        return
      }

      const response = await sessionService.getSession(session_id)

      res.status(200).json(response)
    } catch (error: unknown) {
      logger.error(`errorAnalysisHandler | error: ${error}`)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const finishSessionHandler = (sessionService: ISessionService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const session_id = req.params.session_id

      if (!session_id) {
        res.status(400).json({
          error: "finishSessionHandler | Missing required fields in payload",
        })
        return
      }

      const response = await sessionService.finishSession(session_id)

      res.status(200).json(response)
    } catch (error: unknown) {
      logger.error(`errorAnalysisHandler | error: ${error}`)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}
