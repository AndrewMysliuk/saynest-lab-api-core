import { Request } from "express"

import bcrypt from "bcryptjs"
import crypto from "crypto"
import jwt from "jsonwebtoken"

import { serverConfig } from "../config"
import { IUserEntity, IUserJWTPayload } from "../types"

const ACCESS_TOKEN_EXPIRATION = "15m"
const ACCESS_TOKEN_SECRET = serverConfig.ACCESS_TOKEN_SECRET

const REFRESH_TOKEN_BYTES = 64

export function generateAccessToken(user: IUserEntity): string {
  const payload = {
    user_id: user._id.toString(),
    organization_id: user.organization_id.toString(),
  }

  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRATION,
  })
}

export function generateRefreshTokenHash(): string {
  const randomBytes = crypto.getRandomValues(new Uint8Array(REFRESH_TOKEN_BYTES))
  return Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export async function hashPassword(plain: string): Promise<string> {
  const saltRounds = 10
  return bcrypt.hash(plain, saltRounds)
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

export function parseAuthToken(req: Request): IUserJWTPayload | null {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.split(" ")[1]

  try {
    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET) as IUserJWTPayload
    return {
      user_id: payload.user_id,
      organization_id: payload.organization_id,
    }
  } catch {
    return null
  }
}
