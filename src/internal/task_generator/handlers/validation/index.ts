import { z } from "zod"

import { GPTModelType, GPTRoleType, IGPTPayload, TaskModeEnum, TaskTypeEnum, VocabularyFrequencyLevelEnum } from "../../../../types"

export const gptPayloadSchema: z.ZodType<IGPTPayload> = z.object({
  model: z.custom<GPTModelType>(),
  messages: z
    .array(
      z.object({
        role: z.custom<GPTRoleType>(),
        content: z.string(),
      }),
    )
    .optional(),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().optional(),
  stream: z.boolean().optional(),
})

export const taskGeneratorRequestSchema = z.object({
  user_id: z.string(),
  organization_id: z.string(),

  gpt_payload: gptPayloadSchema,

  type: z.nativeEnum(TaskTypeEnum),
  mode: z.nativeEnum(TaskModeEnum),

  topic_ids: z.array(z.string()).optional(),
  topic_titles: z.array(z.string()).optional(),

  level_cefr: z.array(z.nativeEnum(VocabularyFrequencyLevelEnum)).optional(),

  context: z.string().optional(),
  sandbox_prompt: z.string().optional(),
  sentence_count: z.number().min(1).optional(),
  blank_count: z.number().min(1).optional(),

  language: z.string(),
  native_language: z.string(),
})

export type ITaskGeneratorRequest = z.infer<typeof taskGeneratorRequestSchema>
