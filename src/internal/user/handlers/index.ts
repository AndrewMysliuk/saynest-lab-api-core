import { Request, RequestHandler, Response } from "express"

import { IUserService } from ".."
import { logger } from "../../../utils"
import { UserUpdateSchema } from "./validation"

export const getUserHandler = (userService: IUserService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const user_id = req.user!.user_id

      const response = await userService.getById(user_id)

      res.status(200).json(response)
    } catch (error: unknown) {
      logger.error(`getUserHandler | error: ${error}`)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const patchUserHandler = (userService: IUserService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const user_id = req.user!.user_id

      const parsed = UserUpdateSchema.safeParse(req.body)

      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() })
        return
      }

      const response = await userService.update(user_id, parsed.data)

      res.status(200).json(response)
    } catch (error: unknown) {
      logger.error(`patchUserHandler | error: ${error}`)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}
