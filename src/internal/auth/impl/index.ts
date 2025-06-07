import mongoose from "mongoose"

import { IAuthService } from ".."
import { googleClient, serverConfig } from "../../../config"
import CountryList from "../../../json_data/countries.json"
import { IAuthResponse, IGoogleAuth, ILoginRequest, IRegisterRequest, UserRoleEnum } from "../../../types"
import { createScopedLogger, generateAccessToken, generateRefreshTokenHash, verifyPassword } from "../../../utils"
import { IOrganisationService } from "../../organisation"
import { IUserService } from "../../user"
import { IUserProgressService } from "../../user_progress"
import { IRepository } from "../storage"

const log = createScopedLogger("AuthService")

export const INVALID_CREDENTIALS = "AUTH.INVALID_CREDENTIALS"
export const INVALID_REFRESH_TOKEN = "AUTH.INVALID_REFRESH_TOKEN"
export const REFRESH_TOKEN_EXPIRED = "AUTH.REFRESH_TOKEN_EXPIRED"
export const USER_NOT_FOUND = "AUTH.USER_NOT_FOUND"

export class AuthService implements IAuthService {
  private readonly authRepo: IRepository
  private readonly userService: IUserService
  private readonly orgService: IOrganisationService
  private readonly userProgressService: IUserProgressService

  constructor(authRepo: IRepository, userService: IUserService, orgService: IOrganisationService, userProgressService: IUserProgressService) {
    this.authRepo = authRepo
    this.userService = userService
    this.orgService = orgService
    this.userProgressService = userProgressService
  }

  async loginWithGoogle(dto: IGoogleAuth): Promise<IAuthResponse> {
    const ticket = await googleClient.verifyIdToken({
      idToken: dto.id_token,
      audience: serverConfig.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()

    if (!payload || !payload.email) {
      throw new Error("Invalid Google token")
    }

    const locale = payload.locale || "en"
    const explanation_language = locale.split("-")[0] || "en"
    const country = locale.split("-")[1]?.toUpperCase() || "GB"
    const email = payload.email
    const first_name = payload.given_name || "Google"
    const last_name = payload.family_name || "User"

    let user = await this.userService.getByEmail(email)

    if (!user) {
      const session = await mongoose.startSession()
      session.startTransaction()

      try {
        const organization = await this.orgService.create(`User's Organization`, { session })

        const userDoc = await this.userService.create(
          {
            email,
            password: "google_oauth",
            first_name,
            last_name,
            country,
            explanation_language,
            role: UserRoleEnum.OWNER,
            is_email_confirmed: true,
            organization_id: organization._id.toString(),
          },
          { session },
        )

        await this.orgService.setOwner(organization._id.toString(), userDoc._id.toString(), { session })

        await this.userProgressService.createIfNotExists(userDoc._id.toString(), organization._id.toString(), { session })

        user = userDoc
        await session.commitTransaction()
      } catch (err) {
        await session.abortTransaction()
        throw err
      } finally {
        session.endSession()
      }
    }

    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshTokenHash()

    await this.authRepo.create({
      user_id: user._id,
      organization_id: user.organization_id,
      token: refreshToken,
      ip: dto.ip,
      user_agent: dto.user_agent,
      created_at: new Date(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    })

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user,
    }
  }

  async register(dto: IRegisterRequest, ip: string, user_agent: string): Promise<IAuthResponse> {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      const { email, password, first_name, last_name, country, organization_name } = dto
      const orgName = organization_name || `User's Organization`

      const organization = await this.orgService.create(orgName, { session })

      const explanation_language = CountryList.find((item) => item.alpha_2.toLowerCase() === country.toLowerCase())?.language_iso || null

      const user = await this.userService.create(
        {
          email,
          password,
          first_name,
          last_name,
          country,
          explanation_language,
          role: UserRoleEnum.OWNER,
          organization_id: organization._id.toString(),
        },
        { session },
      )

      await this.orgService.setOwner(organization._id.toString(), user._id.toString(), { session })

      await this.userProgressService.createIfNotExists(user._id.toString(), organization._id.toString(), { session })

      const accessToken = generateAccessToken(user)
      const refreshToken = generateRefreshTokenHash()

      await this.authRepo.create(
        {
          user_id: user._id,
          organization_id: organization._id,
          token: refreshToken,
          ip,
          user_agent,
          created_at: new Date(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        { session },
      )

      await session.commitTransaction()

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user,
      }
    } catch (error: unknown) {
      await session.abortTransaction()
      log.error("register", "error", { error })
      throw error
    } finally {
      session.endSession()
    }
  }

  async login(dto: ILoginRequest, ip: string, user_agent: string): Promise<IAuthResponse> {
    try {
      const { email, password } = dto

      const user = await this.userService.getByEmail(email)

      if (!user) {
        throw new Error(INVALID_CREDENTIALS)
      }

      const isValidPassword = await verifyPassword(password, user.password)

      if (!isValidPassword) {
        throw new Error(INVALID_CREDENTIALS)
      }

      const accessToken = generateAccessToken(user)
      const refreshToken = generateRefreshTokenHash()

      await this.authRepo.create({
        user_id: user._id,
        organization_id: user.organization_id,
        token: refreshToken,
        ip,
        user_agent,
        created_at: new Date(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      })

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user,
      }
    } catch (error: unknown) {
      log.error("login", "error", { error })
      throw error
    }
  }

  async refreshAccessToken(refresh_token: string): Promise<string> {
    try {
      const tokenEntry = await this.authRepo.getByToken(refresh_token)

      if (!tokenEntry) {
        throw new Error(INVALID_REFRESH_TOKEN)
      }

      if (tokenEntry.expires_at.getTime() < Date.now()) {
        throw new Error(REFRESH_TOKEN_EXPIRED)
      }

      const user = await this.userService.getById(tokenEntry.user_id.toString())

      if (!user) {
        throw new Error(USER_NOT_FOUND)
      }

      const newAccessToken = generateAccessToken(user)

      return newAccessToken
    } catch (error: unknown) {
      log.error("refreshAccessToken", "error", { error })
      throw error
    }
  }

  async logout(refresh_token: string): Promise<void> {
    try {
      await this.authRepo.deleteByToken(refresh_token)
    } catch (error: unknown) {
      log.error("logout", "error", { error })
      throw error
    }
  }
}
