import { Router } from "express"

import { acceptPoliciesHandler, getUserHandler, patchUserHandler } from "../handlers"
import { IUserService } from "../index"

export const createUserRouter = (userService: IUserService): Router => {
  const router = Router()

  router.patch("/", patchUserHandler(userService))
  router.get("/", getUserHandler(userService))
  router.patch("/accept-policies", acceptPoliciesHandler(userService))

  return router
}
