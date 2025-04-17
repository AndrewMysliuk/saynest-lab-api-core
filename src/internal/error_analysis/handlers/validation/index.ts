import { z } from "zod"

const GPTRoleType = z.enum(["user", "system", "assistant"])
const GPTModelType = z.enum(["gpt-4-turbo", "gpt-4", "gpt-4o", "gpt-4.1"])

const GPTMessage = z.object({
  role: GPTRoleType,
  content: z.string(),
})

const GPTPayloadSchema = z.object({
  model: GPTModelType,
  messages: z.array(GPTMessage).optional(),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().int().optional(),
  stream: z.boolean().optional(),
})

export const ErrorAnalysisRequestSchema = z.object({
  gpt_payload: GPTPayloadSchema,
  session_id: z.string(),
  target_language: z.string(),
  user_language: z.string(),
  discussion_topic: z.string().optional(),
})

export type ErrorAnalysisRequest = z.infer<typeof ErrorAnalysisRequestSchema>
