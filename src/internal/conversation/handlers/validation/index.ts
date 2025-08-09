import { FunctionParameters } from "openai/resources"
import { z } from "zod"

const objectIdRegex = /^[a-f\d]{24}$/i

export const whisperSchema = z.object({
  prompt: z.string().optional(),
  audio_file: z.any().refine((file): file is Express.Multer.File => file && typeof file === "object" && "originalname" in file && "buffer" in file, {
    message: "Invalid file type",
  }),
})

export const functionParametersSchema: z.ZodType<FunctionParameters> = z.object({
  type: z.enum(["object", "array", "string", "integer", "boolean", "number"]),
  properties: z
    .record(
      z.string(),
      z.lazy(() => functionParametersSchema),
    )
    .optional(),
  items: z.lazy(() => functionParametersSchema).optional(),
  required: z.array(z.string()).optional(),
  enum: z.array(z.union([z.string(), z.number()])).optional(),
  description: z.string().optional(),
  minimum: z.number().optional(),
  maximum: z.number().optional(),
  default: z.any().optional(),
})

export const gptModelSchema = z.object({
  model: z.enum(["gpt-5", "gpt-4o"]),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "system", "assistant"]),
        content: z.string(),
      }),
    )
    .optional(),
  temperature: z.number().optional(),
  max_tokens: z.number().optional(),
  stream: z.boolean().optional(),
})

// export const ttsSchema = z.object({
//   model: z.enum(["tts-1", "tts-1-hd"]),
//   voice: z.enum(["alloy", "echo", "fable", "onyx", "nova", "shimmer"]),
//   input: z.string().optional(),
//   response_format: z.enum(["mp3", "opus", "aac", "flac", "wav", "pcm"]).optional(),
//   speed: z.number().optional(),
//   stream: z.boolean().optional(),
// })

// export const ttsSchema = z.object({
//   input: z.string().optional(),
//   voice: z.string(),
//   model: z.string().optional(),
//   response_format: z.enum(["mp3", "wav", "ogg"]).optional(),
//   voice_settings: z
//     .object({
//       stability: z.number().optional(),
//       similarity_boost: z.number().optional(),
//     })
//     .optional(),
// })

export const ttsSchema = z.object({
  input: z.string().optional(),
  language_code: z.string(),
  response_format: z.enum(["mp3", "wav"]),
})

export const systemSchema = z.object({
  session_id: z.string().regex(objectIdRegex, {
    message: "session_id mast have an ObjectId type",
  }),
  prompt_id: z.string(),
})

export const conversationSchema = z.object({
  whisper: whisperSchema,
  gpt_model: gptModelSchema,
  tts: ttsSchema,
  system: systemSchema,
  target_language: z.string(),
  explanation_language: z.string(),
})
