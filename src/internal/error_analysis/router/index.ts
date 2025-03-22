import { Router } from "express"

import { IErrorAnalysis } from ".."
import { errorAnalysisHandler } from "../handlers"

export const createErrorAnalysisRouter = (errorAnalysisService: IErrorAnalysis): Router => {
  const router = Router()

  router.post("/", errorAnalysisHandler(errorAnalysisService))

  return router
}
