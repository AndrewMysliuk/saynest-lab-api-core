import { Router } from "express"

import { superUserOnlyMiddleware } from "../../../middlewares"
import { createIfNotExistsHandler, getByUserIdHandler, updateUserProgressHandler } from "../handlers"
import { IUserProgressService } from "../index"

export const createUserProgressRouter = (userPregressService: IUserProgressService): Router => {
  const router = Router()

  router.post("/", superUserOnlyMiddleware, createIfNotExistsHandler(userPregressService))
  router.get("/", getByUserIdHandler(userPregressService))
  router.patch("/", superUserOnlyMiddleware, updateUserProgressHandler(userPregressService))

  return router
}
