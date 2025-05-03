import { NextFunction, Request, Response } from "express"

import axios from "axios"

import { serverConfig } from "../config"
import { parseAuthToken } from "../utils"
import logger from "../utils/logger"

const CAPTCHA_SITE_KEY = serverConfig.CAPTCHA_SITE_KEY
const isCloudRun = !!process.env.K_SERVICE

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const user = parseAuthToken(req)

  if (!user) {
    res.status(401).json({ error: "Invalid or expired access token" })
    return
  }

  req.user = user
  next()
}

export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  const user = parseAuthToken(req)

  if (user) {
    req.user = user
  }

  next()
}

export const verifyCaptchaMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (!isCloudRun) {
    logger.info("Skipping captcha middleware in local/dev environment")
    return next()
  }

  try {
    const { hcaptcha_token } = req.body

    if (!hcaptcha_token) {
      res.status(400).json({ error: "No hCaptcha token provided" })
      return
    }

    const verifyResponse = await axios.post(
      "https://hcaptcha.com/siteverify",
      new URLSearchParams({
        secret: CAPTCHA_SITE_KEY,
        response: hcaptcha_token,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    )

    const { success } = verifyResponse.data

    if (!success) {
      // res.status(403).json({ error: "Failed hCaptcha verification" })
      res.status(403).json({ error: verifyResponse.data, secret: CAPTCHA_SITE_KEY })
      return
    }

    next()
  } catch (error) {
    logger.error(`verifyCaptcha error:`, error)
    res.status(500).json({ error: "Internal Server Error during captcha verification" })
  }
}
