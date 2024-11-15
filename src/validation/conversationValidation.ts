import { z } from "zod"

export const whisperSchema = z.object({
  prompt: z.string().optional(),
  audioFile: z
    .any()
    .refine((file): file is Express.Multer.File => file && typeof file === "object" && "originalname" in file && "buffer" in file, {
      message: "Invalid file type",
    }),
})

export const gptModelSchema = z.object({
  model: z.enum(["gpt-4-turbo", "gpt-4", "gpt-4o", "gpt-4o-mini"]),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "system", "assistant"]),
        content: z.string(),
      })
    )
    .optional(),
  temperature: z.number().optional(),
  max_tokens: z.number().optional(),
  stream: z.boolean().optional(),
})

export const ttsSchema = z.object({
  model: z.enum(["tts-1", "tts-1-hd"]),
  voice: z.enum(["alloy", "echo", "fable", "onyx", "nova", "shimmer"]),
  input: z.string().optional(),
  response_format: z.enum(["mp3", "opus", "aac", "flac", "wav", "pcm"]).optional(),
  speed: z.number().optional(),
  stream: z.boolean().optional(),
})

export const systemSchema = z.object({
  sessionId: z.string().optional(),
  globalPrompt: z.string(),
})

export const conversationSchema = z.object({
  whisper: whisperSchema,
  gpt_model: gptModelSchema,
  tts: ttsSchema,
  system: systemSchema,
})
