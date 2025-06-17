import { IPromptScenarioEntity } from "../types"

export function generateFinallyPrompt(scenario: IPromptScenarioEntity): string {
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

Below is a set of possible questions you can use to guide the conversation.
Use them flexibly, based on the user's responses and needs:
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

This phrase must be used to gracefully conclude the interaction when the user's goals appear to be met.  
Do **not** skip or paraphrase — it signals task completion for the system.

Use exactly:
"${meta.model_end_behavior}"
`.trim()
}

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
