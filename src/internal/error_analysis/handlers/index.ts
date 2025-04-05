import { Request, RequestHandler, Response } from "express"

import { IErrorAnalysis } from ".."
import { IErrorAnalysisRequest } from "../../../types"
import logger from "../../../utils/logger"

export const errorAnalysisHandler = (errorAnalysisService: IErrorAnalysis): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { gpt_payload, session_id } = req.body as IErrorAnalysisRequest

      if (!gpt_payload.model || !gpt_payload.messages || !session_id) {
        res.status(400).json({
          error: "errorAnalysisHandler | Missing required fields in payload",
        })
        return
      }

      const response = await errorAnalysisService.conversationErrorAnalysis(session_id, gpt_payload)

      res.status(200).json(response)
    } catch (error: unknown) {
      logger.error(`errorAnalysisHandler | error: ${error}`)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}
