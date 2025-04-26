import { z } from "zod"

import { TaskModeEnum, TaskTypeEnum } from "../../../../types"

export const TaskGeneratorRequestSchema = z.object({
  session_id: z.string().min(1, "session_id is required"),
  type: z.nativeEnum(TaskTypeEnum),
  mode: z.nativeEnum(TaskModeEnum),
  target_language: z.string().min(1, "target_language is required"),
  explanation_language: z.string().min(1, "explanation_language is required"),
  task_sentences_count: z.number().min(1),
  topic_title: z.string().min(3),
})

export type TaskGeneratorRequestType = z.infer<typeof TaskGeneratorRequestSchema>
