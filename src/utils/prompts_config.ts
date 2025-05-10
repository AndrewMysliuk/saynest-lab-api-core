import { IDictionaryEntry, IModuleScenario, IPhraseEntry, IPromptGoal, IPromptScenario, ModuleTypeEnum, VocabularyFrequencyLevelEnum } from "../types"

function maybeRandomizeOptionalSteps(optionalSteps: string[], min: number, max: number): string[] {
  const total = optionalSteps.length

  if (total < min) return optionalSteps

  const upperBound = Math.min(max, total)
  const count = Math.floor(Math.random() * (upperBound - min + 1)) + min
  return optionalSteps
    .slice()
    .sort(() => 0.5 - Math.random())
    .slice(0, count)
}

export function generateFinallyPrompt(raw: any): string {
  const scenario: IPromptScenario = transformSingleScenarioJson(raw)
  const { title, level, model_behavior, user_content, meta } = scenario
  const { setting, situation, goal, steps, optional_steps = [] } = model_behavior.scenario

  let finalSteps: string[] = steps

  if (meta.question_count_range && optional_steps.length) {
    const { min, max } = meta.question_count_range

    const randomized = maybeRandomizeOptionalSteps(optional_steps, min, max)
    finalSteps = [...steps, ...randomized]
  }

  const goalHints = finalSteps.map((s, i) => `  ${i + 1}. ${s}`).join("\n")
  const userGoals = user_content.goals?.length ? user_content.goals.map((g) => `- ${g.phrase}`).join("\n") : "- Help the user complete a realistic communication task"

  const vocabBlock = user_content.dictionary.map((entry) => `- ${entry.word}: ${entry.meaning}`).join("\n")
  const expressionsBlock = user_content.phrases.map((entry) => `- "${entry.phrase}"`).join("\n")

  return `
====================
SCENARIO CONTEXT
====================

Title: ${title}
Level: ${level} 
Setting: ${setting}  
Your Role: ${situation}  
Overall Goal: ${goal}

====================
USER GOALS
====================

${userGoals}

====================
CONVERSATION FLOW
====================

${goalHints}

====================
LANGUAGE SUPPORT
====================

Useful Vocabulary:
${vocabBlock}

Useful Phrases:
${expressionsBlock}

====================
ENDING PHRASE
====================

When the user has likely completed their goals, use this phrase:
"${meta.model_end_behavior}"
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

function normalizeTranslation(value: any): Record<string, string> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value
  }

  return { uk: String(value || "") }
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
          translation: normalizeTranslation(goal.translation),
        }),
      ),
      dictionary: (item.user_content.dictionary || []).map(
        (entry: any): IDictionaryEntry => ({
          word: entry.word,
          translation: normalizeTranslation(entry.translation),
          meaning: entry.meaning,
        }),
      ),
      phrases: (item.user_content.phrases || []).map(
        (entry: any): IPhraseEntry => ({
          phrase: entry.phrase,
          translation: normalizeTranslation(entry.translation),
          meaning: entry.meaning || "",
        }),
      ),
    },
    model_behavior: {
      prompt: item.model_behavior?.prompt || "",
      scenario: {
        setting: item.model_behavior?.scenario?.setting || "",
        situation: item.model_behavior?.scenario?.situation || "",
        goal: item.model_behavior?.scenario?.goal || "",
        steps: item.model_behavior?.scenario?.steps || [],
        optional_steps: item.model_behavior?.scenario?.steps || [],
      },
    },
    meta: {
      estimated_duration_minutes: item.meta?.estimated_duration_minutes || 5,
      max_turns: item.meta?.max_turns || 10,
      model_end_behavior: item.meta?.model_end_behavior || "",
      target_language: item.meta?.target_language || "English",
      explanation_language: item.meta?.explanation_language || "Ukrainian",
      question_count_range: item.meta?.question_count_range ?? null,
    },
    finally_prompt: "",
  }
}
