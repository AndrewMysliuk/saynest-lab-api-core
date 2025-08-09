import { z } from "zod"

const GPTRoleType = z.enum(["user", "system", "assistant"])
const GPTModelType = z.enum(["gpt-5", "gpt-4o"])

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
  explanation_language: z.string(),
  prompt_id: z.string(),
})

export type ErrorAnalysisRequest = z.infer<typeof ErrorAnalysisRequestSchema>
