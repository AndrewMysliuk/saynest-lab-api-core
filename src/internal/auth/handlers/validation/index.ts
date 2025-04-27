import { z } from "zod"

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  country: z.string().min(2),
  organization_name: z.string().optional(),
})
