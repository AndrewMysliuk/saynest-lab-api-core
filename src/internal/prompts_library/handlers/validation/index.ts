import { z } from "zod"

import { ModuleTypeEnum, VocabularyFrequencyLevelEnum } from "../../../../types"

export const CreateScenarioSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  level: z.nativeEnum(VocabularyFrequencyLevelEnum),
  user_content: z.object({
    goals: z.array(
      z.object({
        phrase: z.string().min(1),
        translation: z.record(z.string().min(1)),
      }),
    ),
    dictionary: z.array(
      z.object({
        word: z.string().min(1),
        translation: z.record(z.string().min(1)),
        meaning: z.string().min(1),
      }),
    ),
    phrases: z.array(
      z.object({
        phrase: z.string().min(1),
        translation: z.record(z.string().min(1)),
        meaning: z.string().min(1),
      }),
    ),
  }),
  model_behavior: z.object({
    prompt: z.string().min(1),
    scenario: z.object({
      setting: z.string().min(1),
      situation: z.string().min(1),
      goal: z.string().min(1),
      steps: z.array(z.string().min(1)),
      optional_steps: z.array(z.string().min(1)),
    }),
  }),
  meta: z.object({
    estimated_duration_minutes: z.number().min(1),
    max_turns: z.number().min(1),
    model_end_behavior: z.string().min(1),
    target_language: z.string().min(1),
    explanation_language: z.string().min(1),
    question_count_range: z
      .object({
        min: z.number(),
        max: z.number(),
      })
      .nullable(),
  }),
  is_module_only: z.boolean().optional(),
})

export const UpdateScenarioSchema = CreateScenarioSchema.partial()

export const CreateModuleSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  level: z.array(z.nativeEnum(VocabularyFrequencyLevelEnum)),
  tags: z.array(z.string().min(1)),
  type: z.nativeEnum(ModuleTypeEnum),
  scenarios: z.array(z.string().min(1)),
  submodules: z.array(
    z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      description: z.string().min(1),
      tips: z.array(z.string().min(1)),
      tags: z.array(z.string().min(1)).optional(),
      difficulty: z.string().optional(),
      scenarios: z.array(z.string().min(1)),
    }),
  ),
})

export const UpdateModuleSchema = CreateModuleSchema.partial()
