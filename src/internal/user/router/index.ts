import { Router } from "express"

import { getUserHandler, patchUserHandler } from "../handlers"
import { IUserService } from "../index"

export const createUserRouter = (userService: IUserService): Router => {
  const router = Router()

  router.patch("/", patchUserHandler(userService))
  router.get("/", getUserHandler(userService))

  return router
}
