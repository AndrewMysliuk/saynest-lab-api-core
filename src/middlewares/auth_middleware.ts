import { NextFunction, Request, Response } from "express"

import { parseAuthToken } from "../utils"

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
