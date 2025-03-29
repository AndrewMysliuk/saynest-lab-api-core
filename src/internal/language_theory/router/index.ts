import { Router } from "express"

import { ILanguageTheory } from ".."
import { getTheoryByLanguageHandler } from "../handlers"

export const createLanguageTheoryRouter = (languageTheoryService: ILanguageTheory): Router => {
  const router = Router()

  router.get("/:language", getTheoryByLanguageHandler(languageTheoryService))

  return router
}
