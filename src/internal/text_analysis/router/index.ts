import { Router } from "express"

import { ITextAnalysis } from ".."
import { textAnalysisHandler } from "../handlers"

export const createTextAnalysisRouter = (textAnalysisService: ITextAnalysis): Router => {
  const router = Router()

  router.post("/", textAnalysisHandler(textAnalysisService))

  return router
}
