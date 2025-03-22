import { Request, RequestHandler, Response } from "express"

import { ITextAnalysis } from ".."
import { IGPTPayload } from "../../../types"
import logger from "../../../utils/logger"

export const textAnalysisHandler = (textAnalysisService: ITextAnalysis): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { model, messages } = req.body as IGPTPayload

      if (!model || !messages) {
        res.status(400).json({
          error: "gptController | Missing required fields in payload",
        })
        return
      }

      const response = await textAnalysisService.gptConversation(req.body)

      res.status(200).json(response)
    } catch (error: unknown) {
      logger.error(`gptController | error in gptConversationHandler: ${error}`)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}
