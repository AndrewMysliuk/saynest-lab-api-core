import { z } from "zod"

import { UserRoleEnum, UserStatusEnum } from "../../../../types"

export const UserSettingsSchema = z.object({
  phone: z.string().optional(),
  avatar_url: z.string().url().optional(),
})

export const UserUpdateSchema = z.object({
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  country: z.string().min(2).optional(),
  explanation_language: z.string().min(2).optional(),
  role: z.nativeEnum(UserRoleEnum).optional(),
  status: z.nativeEnum(UserStatusEnum).optional(),
  settings: UserSettingsSchema.optional(),
})
