import { Router } from "express"

import { ITextAnalysis } from ".."
import { streamingTextAnalysisHandler } from "../handlers"

export const createTextAnalysisRouter = (textAnalysisService: ITextAnalysis): Router => {
  const router = Router()

  router.post("/", streamingTextAnalysisHandler(textAnalysisService))

  return router
}
