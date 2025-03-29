import { z } from "zod"

import { VocabularyFrequencyLevelEnum } from "../../../../types"

export const startSimulationRequestSchema = z.object({
  user_id: z.string().min(1, "user_id is required"),
  organization_id: z.string().min(1, "organization_id is required"),
  language: z.string().min(1, "language is required"),
  native_language: z.string().min(1, "native_language is required"),
  scenario_prompt: z.string().min(1, "scenario_prompt is required"),
  level_cefr: z.array(z.nativeEnum(VocabularyFrequencyLevelEnum)).optional(),
})
