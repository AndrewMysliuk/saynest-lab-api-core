import { Request, RequestHandler, Response } from "express"

import { IOrganisationService } from ".."
import { createScopedLogger } from "../../../utils"

const log = createScopedLogger("OrganisationHandler")

export const getByIdHandler = (orgService: IOrganisationService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const organization_id = req.user?.organization_id as string

      const response = await orgService.getById(organization_id)

      res.status(200).json(response)
    } catch (error: unknown) {
      log.error("getByIdHandler", "error", { error })
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}
