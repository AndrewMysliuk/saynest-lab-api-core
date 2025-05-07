import { isArgumentsObject } from "util/types"

import { IDictionaryEntry, IModuleScenario, IPhraseEntry, IPromptGoal, IPromptScenario, ModuleTypeEnum, VocabularyFrequencyLevelEnum } from "../types"

export function generateFinallyPrompt(raw: any): string {
  const scenario: IPromptScenario = transformSingleScenarioJson(raw)
  const { title, level, model_behavior, user_content } = scenario

  const goalsFlat = user_content.goals?.length ? user_content.goals.map((g) => g.phrase).join("; ") : "help the user complete a realistic communication task"

  const { setting, situation, goal } = model_behavior.scenario

  return `
You are participating in a roleplay scenario titled "${title}".
The user's language level is approximately ${level}, and the conversation takes place in the setting of "${setting}".
You are in the role of ${situation}.
Your overall objective is: ${goal}.
Maintain a realistic and coherent conversation to help the user achieve the following goals: ${goalsFlat}.
Do not break character, correct the user's grammar, or go off-topic.
Use relevant vocabulary from the context naturally.
  `.trim()
}

export function transformSingleModuleJson(item: any): IModuleScenario {
  return {
    id: String(item.id),
    title: String(item.title),
    description: String(item.description),
    level: Array.isArray(item.level)
      ? (item.level.filter((lvl: string) => Object.values(VocabularyFrequencyLevelEnum).includes(lvl as VocabularyFrequencyLevelEnum)) as VocabularyFrequencyLevelEnum[])
      : [],
    tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
    type: Object.values(ModuleTypeEnum).includes(item.type) ? item.type : ModuleTypeEnum.FLAT,
    scenarios: Array.isArray(item.scenarios) ? item.scenarios.map(String) : [],
    submodules: Array.isArray(item.submodules)
      ? item.submodules.map((sm: any) => ({
          id: String(sm.id),
          title: String(sm.title),
          description: String(sm.description),
          tips: Array.isArray(sm.tips) ? sm.tips.map(String) : [],
          scenarios: Array.isArray(sm.scenarios) ? sm.scenarios.map(String) : [],
        }))
      : [],
  }
}

export function transformSingleScenarioJson(item: any): IPromptScenario {
  const level = item.level?.toUpperCase?.() as keyof typeof VocabularyFrequencyLevelEnum
  const safeLevel = VocabularyFrequencyLevelEnum[level] || VocabularyFrequencyLevelEnum.B2

  return {
    id: item.id,
    module: item.module,
    title: item.title,
    description: item.description,
    level: safeLevel,
    user_content: {
      goals: (item.user_content.goals || []).map(
        (goal: any): IPromptGoal => ({
          phrase: goal.phrase,
          translation: goal.translation,
        }),
      ),
      dictionary: (item.user_content.dictionary || []).map(
        (entry: any): IDictionaryEntry => ({
          word: entry.word,
          translation: entry.translation,
          meaning: entry.meaning,
        }),
      ),
      phrases: (item.user_content.phrases || []).map(
        (entry: any): IPhraseEntry => ({
          phrase: entry.phrase,
          translation: entry.translation,
          meaning: entry.meaning,
        }),
      ),
    },
    model_behavior: {
      prompt: item.prompt,
      scenario: {
        setting: item.model_behavior.scenario.setting,
        situation: item.model_behavior.scenario.situation,
        goal: item.model_behavior.scenario.goal,
        steps: item.model_behavior.scenario.steps || [],
      },
    },
    meta: {
      estimated_duration_minutes: item.meta?.estimated_duration_minutes || 5,
      max_turns: item.meta?.max_turns || 10,
      model_end_behavior: item.meta?.model_end_behavior || "",
      target_language: item.meta?.target_language || "English",
      explanation_language: item.meta?.explanation_language || "Ukrainian",
    },
    finally_prompt: "",
  }
}
