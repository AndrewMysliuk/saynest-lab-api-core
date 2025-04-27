import { Request, RequestHandler, Response } from "express"

import { ISessionService } from ".."
import { ISessionCreateRequest } from "../../../types"
import { ensureStorageDirExists } from "../../../utils"
import logger from "../../../utils/logger"

export const createSessionHandler = (sessionService: ISessionService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { type, system_prompt, prompt_id } = req.body as ISessionCreateRequest

      if (!type || !system_prompt || !prompt_id) {
        res.status(400).json({
          error: "createSessionHandler | Missing required fields in payload",
        })
        return
      }

      const user_id = req.user?.user_id || null
      const organization_id = req.user?.organization_id || null

      const sessionDir = await ensureStorageDirExists()

      const response = await sessionService.createSession({
        prompt_id,
        session_directory: sessionDir,
        user_id,
        organization_id,
        system_prompt,
        type,
      })

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
