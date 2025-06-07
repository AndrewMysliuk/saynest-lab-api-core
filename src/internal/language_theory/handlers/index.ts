import { Request, RequestHandler, Response } from "express"

import { ILanguageTheory } from ".."
import { createScopedLogger } from "../../../utils"

const log = createScopedLogger("LanguageTheoryHandler")

export const getTheoryByLanguageHandler = (languageTheoryService: ILanguageTheory): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const language = req.params.language

      if (!language) {
        res.status(400).json({
          error: "getTheoryByLanguageHandler | Missing required fields in payload",
        })
        return
      }

      const response = await languageTheoryService.listByLanguage(language)

      res.status(200).json(response)
    } catch (error: unknown) {
      log.error("getTheoryByLanguageHandler", "error", { error })
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}
