import { Router } from "express"

import { createIfNotExistsHandler, getByUserIdHandler, updateUserProgressHandler } from "../handlers"
import { IUserProgressService } from "../index"

export const createUserProgressRouter = (userPregressService: IUserProgressService): Router => {
  const router = Router()

  router.post("/", createIfNotExistsHandler(userPregressService))
  router.get("/", getByUserIdHandler(userPregressService))
  router.patch("/", updateUserProgressHandler(userPregressService))

  return router
}
