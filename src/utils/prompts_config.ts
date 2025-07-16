import { IPromptScenarioEntity, SessionIeltsPartEnum } from "../types"

export function generateFinallyPrompt(scenario: IPromptScenarioEntity): string {
  if (scenario.meta.is_it_ielts && scenario.model_behavior.ielts_scenario) {
    return generateIELTSPrompt(scenario)
  }

  if (!scenario.meta.is_it_ielts && scenario.model_behavior.scenario) {
    return generateRegularPrompt(scenario)
  }

  return ""
}

export function generateIELTSPrompt(scenario: IPromptScenarioEntity): string {
  const part = getSingleUsedIeltsPart(scenario)
  const { title, level, meta, model_behavior } = scenario
  const { setting, part1, part2, part3 } = model_behavior.ielts_scenario!

  const part1Block = part1?.topics.map((topic) => topic.questions.map((q) => `  - ${q}`).join("\n")).join("\n")

  const part2Block = part2 ? [`Cue Card Topic: ${part2.title}`, `${part2.question}`, `You should say:`, ...part2.bullet_points.map((bp) => `  - ${bp}`)].join("\n") : ""

  const part3Block = part3?.topics.map((topic) => topic.questions.map((q) => `  - ${q}`).join("\n")).join("\n")

  const header = `
====================
ROLE: IELTS EXAMINER
====================

You are simulating the speaking portion of the official IELTS exam.  
Follow the instructions **exactly**. Do **not** add or modify anything unless told to.  
Use a neutral, formal, and minimal tone throughout.

====================
GENERAL RULES
====================

- Announce only the part number at the start of each section: "Let’s start with Part 1", "Now, Part 2", etc.
- Do **not** mention topic titles or categories.
- Ask the questions one by one. Wait for the user's answer before continuing.
- Do **not** explain, paraphrase, comment on, or evaluate the user's answers.
- Do **not** improvise transitions or add new questions.

✅ Correct:
"Let’s start with Part 1."  
"Do you work or are you a student?"  
(wait for reply)  
"Why did you choose this kind of work/study?"

❌ Incorrect:
"Let’s talk about work."  
"Our topic is Work. First question: Do you work or are you a student?"  
"That was a great answer!"

====================
SCENARIO CONTEXT
====================

Title: ${title}
Estimated User Level: ${level}
Setting: ${setting}
`.trim()

  const part1Prompt = `
====================
PART 1 – INTRODUCTION & INTERVIEW
====================

Say: "Let’s start with Part 1."  
Then ask each of the following questions one at a time, in the given order.

- Before each question, consider what the user has already said.
- If their previous answer already covers the next question, **skip it silently**.
- If a question includes branching logic (e.g. work vs study), ask only the follow-up that matches the user's situation.
- Do **not** ask both sides of a branching question (e.g. avoid asking about work if the user already said they are a student).
- Do **not** comment, evaluate, or improvise.

${part1Block}`.trim()

  const part2Prompt = `
====================
PART 2 – INDIVIDUAL LONG TURN
====================

Say: "Now, Part 2."  
Then read the cue card prompt below and instruct the user to speak for 1–2 minutes:

${part2Block}

After they finish, say only:  
"Thank you. Now, let’s move on to Part 3."

Do not make any other comments.
`.trim()

  const part3Prompt = `
====================
PART 3 – TWO-WAY DISCUSSION
====================

Say: "Now, Part 3."  
Then ask each of the following questions, one at a time, in the given order:

${part3Block}

Do not comment or elaborate on the answers.
`.trim()

  const ending = `
====================
ENDING PHRASE
====================

This phrase **must** be used at the end of the session.  
Say it **exactly** as written. Do **not** paraphrase or change anything.

"${meta.model_end_behavior}"
`.trim()

  if (part === SessionIeltsPartEnum.PART_1) {
    return [header, part1Prompt, ending].join("\n\n").trim()
  }

  if (part === SessionIeltsPartEnum.PART_2) {
    return [header, part2Prompt, ending].join("\n\n").trim()
  }

  if (part === SessionIeltsPartEnum.PART_3) {
    return [header, part3Prompt, ending].join("\n\n").trim()
  }

  return [header, part1Prompt, part2Prompt, part3Prompt, ending].join("\n\n").trim()
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

  const stepHints = finalSteps.map((s, i) => `  ${i + 1}. ${s}`).join("\n")

  const vocabBlock = user_content.dictionary.map((entry) => `- ${entry.word}: ${entry.meaning}`).join("\n")
  const expressionsBlock = user_content.phrases.map((entry) => `- "${entry.phrase}"`).join("\n")

  return `
====================
SCENARIO CONTEXT
====================

Title: ${title}
Estimated User Level: ${level}

====================
SCENARIO INSTRUCTIONS
====================

Setting: ${setting}  
Your Role: ${situation}  
Overall Goal: ${goal}

====================
CONVERSATION FLOW
====================

- Ask all of them, unless the user has already answered or clearly implied the answer.
- Do **not** repeat or rephrase what has already been covered.
- If a question includes a branching logic (e.g. "Do you work or are you a student?"), ask only the follow-up that fits the user's answer.
- You may adjust the order of questions to keep the conversation natural.

Scenario Questions: ${stepHints}

====================
USEFUL PHRASES & VOCABULARY
====================

Encourage the user to use the vocabulary and phrases listed, but do not force them.
Use some of them naturally yourself if appropriate.

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

export function getSingleUsedIeltsPart(prompt: IPromptScenarioEntity): SessionIeltsPartEnum | undefined {
  const scenario = prompt.model_behavior?.ielts_scenario
  if (!scenario) return undefined

  const presentParts: SessionIeltsPartEnum[] = []

  if ("part1" in scenario) presentParts.push(SessionIeltsPartEnum.PART_1)
  if ("part2" in scenario) presentParts.push(SessionIeltsPartEnum.PART_2)
  if ("part3" in scenario) presentParts.push(SessionIeltsPartEnum.PART_3)

  return presentParts.length === 1 ? presentParts[0] : undefined
}
