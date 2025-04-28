import { Request, RequestHandler, Response } from "express"

import { IAuthService } from ".."
import logger from "../../../utils/logger"
import { RegisterRequestSchema } from "./validation"

export const registerHandler = (authService: IAuthService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const ip = req.ip || ""
      const userAgent = req.get("User-Agent") || ""

      const parsed = RegisterRequestSchema.safeParse(req.body)

      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() })
        return
      }

      const result = await authService.register(parsed.data, ip, userAgent)

      res
        .status(201)
        .cookie("refresh_token", result.refresh_token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          path: "/api/auth",
        })
        .json({
          access_token: result.access_token,
          user: result.user,
        })
    } catch (error: unknown) {
      logger.error(`registerHandler | error: ${error}`)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const loginHandler = (authService: IAuthService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const ip = req.ip || ""
      const userAgent = req.get("User-Agent") || ""

      const result = await authService.login(req.body, ip, userAgent)

      res
        .status(200)
        .cookie("refresh_token", result.refresh_token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          path: "/api/auth",
        })
        .json({
          access_token: result.access_token,
          user: result.user,
        })
    } catch (error: unknown) {
      logger.error(`loginHandler | error: ${error}`)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const refreshAccessTokenHandler = (authService: IAuthService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshToken = req?.cookies?.refresh_token

      if (!refreshToken) {
        res.status(401).json({ error: "No refresh token provided" })
        return
      }

      const newAccessToken = await authService.refreshAccessToken(refreshToken)

      res.status(200).json(newAccessToken)
    } catch (error: unknown) {
      logger.error(`refreshAccessTokenHandler | error: ${error}`)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

export const logoutHandler = (authService: IAuthService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshToken = req?.cookies?.refresh_token

      if (!refreshToken) {
        res.status(400).json({ error: "No refresh token provided" })
        return
      }

      await authService.logout(refreshToken)

      res.clearCookie("refresh_token", { path: "/api/auth" }).status(204).send()
    } catch (error: unknown) {
      logger.error(`logoutHandler | error: ${error}`)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}
