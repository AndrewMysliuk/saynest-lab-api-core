import { NextFunction, Request, RequestHandler, Response } from "express"

import { IUserProgressService } from "../internal/user_progress"

export const createActivityMiddleware = (userProgressService: IUserProgressService): RequestHandler => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const user_id = req.user!.user_id
      const method = req.method.toUpperCase()

      const isActiveMethod = ["POST", "PUT", "PATCH"].includes(method)

      if (user_id && isActiveMethod) {
        await userProgressService.markUserActivity(user_id)
      }

      next()
    } catch (err) {
      console.error("[activityMiddleware] Failed to track activity:", err)
      next()
    }
  }
}
