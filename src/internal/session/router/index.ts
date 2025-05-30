import { Router } from "express"

import { ISessionService } from ".."
import { superUserOnlyMiddleware } from "../../../middlewares"
import { createSessionHandler, finishSessionHandler, getSessionHandler } from "../handlers"

export const createSessionRouter = (sessionService: ISessionService): Router => {
  const router = Router()

  router.post("/", createSessionHandler(sessionService))
  router.get("/:session_id", getSessionHandler(sessionService))
  router.patch("/:session_id", superUserOnlyMiddleware, finishSessionHandler(sessionService))

  return router
}
