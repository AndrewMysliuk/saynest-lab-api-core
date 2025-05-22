import { Request, RequestHandler, Response } from "express"

import { IUserProgressService } from ".."
import { logger } from "../../../utils"
import { updateUserProgressSchema } from "./validation"

export const createIfNotExistsHandler = (userProgressService: IUserProgressService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const user_id = req.user!.user_id
      const organization_id = req.user!.organization_id

      const response = await userProgressService.createIfNotExists(user_id, organization_id)

      res.status(200).json(response)
    } catch (error: unknown) {
      logger.error(`createIfNotExistsHandler | error: ${error}`)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const getByUserIdHandler = (userProgressService: IUserProgressService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const user_id = req.user!.user_id

      const progress = await userProgressService.getByUserId(user_id)

      if (!progress) {
        res.status(404).json({ error: "User progress not found" })
        return
      }

      res.status(200).json(progress)
    } catch (error: unknown) {
      logger.error(`getByUserIdHandler | error: ${error}`)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const updateUserProgressHandler = (userProgressService: IUserProgressService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const user_id = req.user!.user_id

      const parsed = updateUserProgressSchema.safeParse(req.body)

      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() })
        return
      }

      const updated = await userProgressService.update(parsed.data, user_id)

      res.status(200).json(updated)
    } catch (error: unknown) {
      logger.error(`updateUserProgressHandler | error: ${error}`)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}
