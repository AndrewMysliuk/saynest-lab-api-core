import mongoose from "mongoose"

import { IAuthService } from ".."
import { ILoginRequest, ILoginResponse, IRegisterRequest, IRegisterResponse, UserRoleEnum } from "../../../types"
import { generateAccessToken, generateRefreshTokenHash, verifyPassword } from "../../../utils"
import logger from "../../../utils/logger"
import { IOrganisationService } from "../../organisation"
import { IUserService } from "../../user"
import { IRepository } from "../storage"

export class AuthService implements IAuthService {
  private readonly authRepo: IRepository
  private readonly userService: IUserService
  private readonly orgService: IOrganisationService

  constructor(authRepo: IRepository, userService: IUserService, orgService: IOrganisationService) {
    this.authRepo = authRepo
    this.userService = userService
    this.orgService = orgService
  }

  async register(dto: IRegisterRequest, ip: string, user_agent: string): Promise<IRegisterResponse> {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      const { email, password, first_name, last_name, country, organization_name } = dto
      const orgName = organization_name || `${first_name}'s Organization`

      const organization = await this.orgService.create(orgName, { session })

      const user = await this.userService.create(
        {
          email,
          password,
          first_name,
          last_name,
          country,
          role: UserRoleEnum.OWNER,
          organization_id: organization._id.toString(),
        },
        { session },
      )

      await this.orgService.setOwner(organization._id.toString(), user._id.toString(), { session })

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
      logger.error(`register | error: ${error}`)
      throw error
    } finally {
      session.endSession()
    }
  }

  async login(dto: ILoginRequest, ip: string, user_agent: string): Promise<ILoginResponse> {
    try {
      const { email, password } = dto

      const user = await this.userService.getByEmail(email)

      if (!user) {
        throw new Error("Invalid credentials")
      }

      const isValidPassword = await verifyPassword(password, user.password)

      if (!isValidPassword) {
        throw new Error("Invalid credentials")
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
      logger.error(`login | error: ${error}`)
      throw error
    }
  }

  async refreshAccessToken(refresh_token: string): Promise<string> {
    try {
      const tokenEntry = await this.authRepo.getByToken(refresh_token)

      if (!tokenEntry) {
        throw new Error("Invalid refresh token")
      }

      if (tokenEntry.expires_at.getTime() < Date.now()) {
        throw new Error("Refresh token expired")
      }

      const user = await this.userService.getById(tokenEntry.user_id.toString())

      if (!user) {
        throw new Error("User not found")
      }

      const newAccessToken = generateAccessToken(user)

      return newAccessToken
    } catch (error: unknown) {
      logger.error(`refreshAccessToken | error: ${error}`)
      throw error
    }
  }

  async logout(refresh_token: string): Promise<void> {
    try {
      await this.authRepo.deleteByToken(refresh_token)
    } catch (error: unknown) {
      logger.error(`logout | error: ${error}`)
      throw error
    }
  }
}
