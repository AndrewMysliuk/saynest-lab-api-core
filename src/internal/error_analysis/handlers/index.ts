import { Request, RequestHandler, Response } from "express"

import { IErrorAnalysis } from ".."
import { createScopedLogger } from "../../../utils"
import { ErrorAnalysisRequestSchema } from "./validation"

const log = createScopedLogger("ErrorAnalysisHandler")

export const errorAnalysisHandler = (errorAnalysisService: IErrorAnalysis): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const parseResult = ErrorAnalysisRequestSchema.safeParse(req.body)

      if (!parseResult.success) {
        res.status(400).json({ error: "Invalid request", details: parseResult.error.format() })
        return
      }

      const dto = parseResult.data

      const user_id = req.user?.user_id || null
      const organization_id = req.user?.organization_id || null

      const response = await errorAnalysisService.conversationErrorAnalysis(dto, user_id, organization_id)

      res.status(200).json(response)
    } catch (error: unknown) {
      log.error("errorAnalysisHandler", "error", { error })
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}
