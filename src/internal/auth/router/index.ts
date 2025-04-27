import { Router } from "express"

import { loginHandler, logoutHandler, refreshAccessTokenHandler, registerHandler } from "../handlers"
import { IAuthService } from "../index"

export const createAuthRouter = (authService: IAuthService): Router => {
  const router = Router()

  router.post("/register", registerHandler(authService))
  router.post("/login", loginHandler(authService))
  router.post("/refresh", refreshAccessTokenHandler(authService))
  router.post("/logout", logoutHandler(authService))

  return router
}
