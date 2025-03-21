import { Router } from "express"
import { textAnalysisHandler } from "../handlers"
import { ITextAnalysis } from ".."

export const createTextAnalysisRouter = (textAnalysisService: ITextAnalysis): Router => {
  const router = Router()

  router.post("/", textAnalysisHandler(textAnalysisService))

  return router
}
