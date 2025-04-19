import { z } from "zod"

const objectIdRegex = /^[a-f\d]{24}$/i

export const StatisticsGenerateRequestSchema = z.object({
  session_id: z.string().regex(objectIdRegex, {
    message: "session_id mast have an ObjectId type",
  }),
  prompt_id: z.string(),
  topic_title: z.string().min(1, "topic_title required"),
  language: z.string().min(1, "language required"),
  user_language: z.string().min(1, "user_language required"),
})
