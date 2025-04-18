import { IDictionaryEntry, IPhraseEntry, IPromptGoal, IPromptScenario, VocabularyFrequencyLevelEnum } from "../types"

export function generatePromptFromScenario(raw: any): string {
  const scenario: IPromptScenario = transformSingleScenarioJson(raw)
  const { title, description, level, scenario: sc, prompt, meta, goals, phrases } = scenario

  const steps = sc.steps?.length ? sc.steps.map((step, i) => `  ${i + 1}. ${step}`).join("\n") : "  (No specific steps were provided. Use your best judgment to guide the conversation.)"

  const languages = sc.allowed_languages?.length ? `[${sc.allowed_languages.join(", ")}]` : `[Any]`

  const guidance = sc.force_topic_focus ? "- Gently guide the user back to the topic if they go off-topic." : "- Allow the conversation to evolve naturally, but stay relevant."

  const goalsBlock = goals?.length ? goals.map((g, i) => `  ${i + 1}. ${g.phrase} (${g.translation})`).join("\n") : "  No specific goals provided."

  const phraseExamples = phrases?.length
    ? phrases
        .slice(0, 3)
        .map((p) => `  - "${p.phrase}" (${p.translation}) → ${p.meaning}`)
        .join("\n")
    : "  No example phrases provided."

  return `
You are in a scenario titled "${title}".
Description: ${description}
User proficiency level: ${level}

Context:
- Setting: ${sc.setting || "unspecified"}
- Situation: ${sc.situation || "unspecified"}
- Goal: ${sc.goal || "Help the user in a realistic, context-aware way."}

Instructions:
- ${prompt || "Respond clearly and supportively to help the user achieve their goal."}
- Only use the following languages: ${languages}
${guidance}
- If the user doesn’t start the conversation, begin it yourself.
- Use realistic, supportive, and flexible dialogue.
- Adjust your language and tone based on the user's level and emotional state.

Conversation flow:
${steps}

User Goals:
${goalsBlock}

Encourage use of the following phrases during the conversation:
${phraseExamples}

Meta:
- Expected duration: ~${meta.estimated_duration_minutes || "5"} minutes
- Recommended turn limit: ~${meta.max_turns || "10"} turns
- Closing message: "${meta.end_behavior || "This concludes our conversation. Thanks!"}"
`.trim()
}

export function transformSingleScenarioJson(item: any): IPromptScenario {
  const level = item.level?.toUpperCase?.() as keyof typeof VocabularyFrequencyLevelEnum
  const safeLevel = VocabularyFrequencyLevelEnum[level] || VocabularyFrequencyLevelEnum.B2

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    level: safeLevel,
    goals: (item.goals || []).map(
      (goal: any): IPromptGoal => ({
        phrase: goal.phrase,
        translation: goal.translation,
        transcription_language: goal.transcription_language || undefined,
      }),
    ),
    scenario: {
      allowed_languages: item.scenario.allowed_languages || ["English"],
      force_topic_focus: !!item.scenario.force_topic_focus,
      setting: item.scenario.setting,
      situation: item.scenario.situation,
      goal: item.scenario.goal,
      steps: item.scenario.steps || [],
    },
    prompt: item.prompt,
    dictionary: (item.dictionary || []).map(
      (entry: any): IDictionaryEntry => ({
        word: entry.word,
        translation: entry.translation,
        meaning: entry.meaning,
      }),
    ),
    phrases: (item.phrases || []).map(
      (entry: any): IPhraseEntry => ({
        phrase: entry.phrase,
        translation: entry.translation,
        meaning: entry.meaning,
      }),
    ),
    meta: {
      estimated_duration_minutes: item.meta?.estimated_duration_minutes || 5,
      max_turns: item.meta?.max_turns || 10,
      end_behavior: item.meta?.end_behavior || "",
    },
    finally_prompt: "",
  }
}
