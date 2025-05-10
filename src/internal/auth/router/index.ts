import { Router } from "express"

import { verifyCaptchaMiddleware } from "../../../middlewares"
import { googleHandler, loginHandler, logoutHandler, refreshAccessTokenHandler, registerHandler } from "../handlers"
import { IAuthService } from "../index"

export const createAuthRouter = (authService: IAuthService): Router => {
  const router = Router()

  router.post("/google", googleHandler(authService))
  router.post("/register", verifyCaptchaMiddleware, registerHandler(authService))
  router.post("/login", verifyCaptchaMiddleware, loginHandler(authService))
  router.get("/refresh", refreshAccessTokenHandler(authService))
  router.get("/logout", logoutHandler(authService))

  return router
}
