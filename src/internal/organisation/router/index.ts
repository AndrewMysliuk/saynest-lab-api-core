import { Router } from "express"

import { IOrganisationService } from ".."
import { getByIdHandler } from "../handlers"

export const createOrganisationRouter = (orgService: IOrganisationService): Router => {
  const router = Router()

  router.get("/info", getByIdHandler(orgService))

  return router
}
