import { Request, RequestHandler, Response } from "express"

import { IErrorAnalysis } from ".."
import logger from "../../../utils/logger"
import { ErrorAnalysisRequestSchema } from "./validation"

export const errorAnalysisHandler = (errorAnalysisService: IErrorAnalysis): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const parseResult = ErrorAnalysisRequestSchema.safeParse(req.body)

      if (!parseResult.success) {
        res.status(400).json({ error: "Invalid request", details: parseResult.error.format() })
        return
      }

      const dto = parseResult.data

      const response = await errorAnalysisService.conversationErrorAnalysis(dto)

      res.status(200).json(response)
    } catch (error: unknown) {
      logger.error(`errorAnalysisHandler | error: ${error}`)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}
