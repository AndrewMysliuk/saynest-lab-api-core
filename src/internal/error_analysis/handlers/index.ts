import { Request, RequestHandler, Response } from "express"

import { IErrorAnalysis } from ".."
import { IGPTPayload } from "../../../types"
import logger from "../../../utils/logger"

export const errorAnalysisHandler = (errorAnalysisService: IErrorAnalysis): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { model, messages } = req.body as IGPTPayload
      const { session_id }: { session_id: string } = req.body

      if (!model || !messages || !session_id) {
        res.status(400).json({
          error: "errorAnalysisHandler | Missing required fields in payload",
        })
        return
      }

      const response = await errorAnalysisService.conversationErrorAnalysis(session_id, req.body)

      res.status(200).json(response)
    } catch (error: unknown) {
      logger.error(`errorAnalysisHandler | error: ${error}`)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}
