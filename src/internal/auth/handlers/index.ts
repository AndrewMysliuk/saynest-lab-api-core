import { Request, RequestHandler, Response } from "express"

import { IAuthService } from ".."
import { createScopedLogger } from "../../../utils"
import { INVALID_CREDENTIALS } from "../impl"
import { RegisterRequestSchema } from "./validation"

const log = createScopedLogger("AuthHandler")

export const googleHandler = (authService: IAuthService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const ip = req.ip || ""
      const user_agent = req.get("User-Agent") || ""

      const { id_token } = req.body

      if (!id_token) {
        res.status(400).json({ error: "Missing Google token" })
        return
      }

      const result = await authService.loginWithGoogle({
        ip,
        id_token,
        user_agent,
      })

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
      log.error("googleHandler", "error", { error })
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

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
    } catch (error: any) {
      log.error("registerHandler", "error", { error })

      if (error?.message?.includes("Email already exists")) {
        res.status(400).json({ error: "Email already exists" })
        return
      }

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
    } catch (error: any) {
      log.error("loginHandler", "error", { error })

      if (error?.message === INVALID_CREDENTIALS) {
        res.status(401).json({ error: "Invalid credentials" })
        return
      }

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
      log.error("refreshAccessTokenHandler", "error", { error })
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
      log.error("logoutHandler", "error", { error })
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}
