import { z } from "zod"

const objectIdRegex = /^[a-f\d]{24}$/i

export const StatisticsGenerateRequestSchema = z.object({
  session_id: z.string().regex(objectIdRegex, {
    message: "session_id должен быть валидным ObjectId (24-символьная hex-строка)",
  }),
  topic_title: z.string().min(1, "topic_title обязателен и не может быть пустым"),
  language: z.string().min(1, "language обязателен"),
  user_language: z.string().min(1, "user_language обязателен"),
})
