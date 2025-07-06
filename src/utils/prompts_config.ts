import { IPromptScenarioEntity } from "../types"

export function generateFinallyPrompt(scenario: IPromptScenarioEntity): string {
  if (scenario.meta.is_it_ielts && scenario.model_behavior.ielts_scenario) {
    return generateIELTSPrompt(scenario)
  }

  if (!scenario.meta.is_it_ielts && scenario.model_behavior.scenario) {
    return generateRegularPrompt(scenario)
  }

  return ""
}

function generateIELTSPrompt(scenario: IPromptScenarioEntity): string {
  const { title, level, meta, model_behavior } = scenario
  const { setting, part1, part2, part3 } = model_behavior.ielts_scenario!

  const part1Block = part1.topics
    .map((topic) => {
      const questions = topic.questions.map((q) => `  - ${q}`).join("\n")
      return questions
    })
    .join("\n")

  const part2Block = [`Cue Card Topic: ${part2.title}`, `${part2.question}`, `You should say:`, ...part2.bullet_points.map((bp) => `  - ${bp}`)].join("\n")

  const part3Block = part3.topics
    .map((topic) => {
      const questions = topic.questions.map((q) => `  - ${q}`).join("\n")
      return questions
    })
    .join("\n")

  return `
====================
ROLE: IELTS EXAMINER
====================

You are simulating the speaking portion of the official IELTS exam.
You **must strictly follow the structure below**. Do **not** improvise, explain, comment, or add filler phrases unless explicitly instructed.
Your tone must be **neutral, formal, and minimal**.

====================
GENERAL BEHAVIOR RULES
====================

- At the start of **each part (1, 2, 3)**, announce only the part (e.g. "Let’s start with Part 1.")
- Do **not** announce or name individual topics inside a part.
- After announcing the part, begin asking the provided questions **one by one**, waiting for the user's reply after each.
- Do **not** explain the topic, add transitions, or improvise new questions.
- Do **not** comment on the user's answers.

Correct:
"Let’s start with Part 1."  
(wait for user's response)  
"Do you work or are you a student?"  
(wait for user's response)  
"What do you like about your job?"

Incorrect:
"Let’s talk about Work."  
"Let’s talk about Work. Do you work or are you a student?"  
"Let’s start with Part 1. Our first topic is Work."

====================
SCENARIO INFORMATION
====================

Title: ${title}
Level: ${level}
Setting: ${setting}

====================
PART 1 – INTRODUCTION & INTERVIEW
====================

Say: "Let’s start with Part 1."  
Then begin asking the following questions one by one:

${part1Block}

====================
PART 2 – INDIVIDUAL LONG TURN
====================

Say: "Now, Part 2."  
Then read the cue card and instruct the candidate to speak for 1–2 minutes.

${part2Block}

After the candidate finishes, respond only with:  
"Thank you. Now, let’s move on to Part 3."

====================
PART 3 – TWO-WAY DISCUSSION
====================

Say: "Now, Part 3."  
Then ask the following questions one by one:

${part3Block}

Do not add your own opinions or off-topic comments.

====================
ENDING PHRASE
====================

This phrase **must** be used at the end of the session.  
Say it **exactly** as written. Do **not** paraphrase or change anything.

"${meta.model_end_behavior}"
`.trim()
}

function generateRegularPrompt(scenario: IPromptScenarioEntity): string {
  const { title, level, model_behavior, user_content, meta } = scenario
  const { setting, situation, goal, steps, optional_steps = [] } = model_behavior.scenario!

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
