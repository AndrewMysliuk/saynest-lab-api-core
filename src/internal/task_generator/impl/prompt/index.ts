import { IPromptScenario, ITaskGeneratorRequest, TaskTypeEnum } from "../../../../types"

const taskTypeReadable: Record<TaskTypeEnum, string> = {
  FILL_BLANK: "Fill in the blanks",
  MULTIPLE_CHOICE: "Multiple choice",
}

export function getReadableSchemaInstructions(type: TaskTypeEnum, count: number): string {
  const plural = count > 1 ? "sentences" : "sentence"

  switch (type) {
    case TaskTypeEnum.FILL_BLANK:
      return `
====================
OUTPUT FORMAT: FILL IN THE BLANK
====================

Return a single valid JSON object with **one top-level key**: "sentences".

The "sentences" key must map to an array of exactly ${count} ${plural}.  
Each item must follow the structure below:

--------------------
Structure of Each Sentence Object:
--------------------
- id (number): A unique numeric ID (e.g., 1, 2).
- prompt (string): A sentence with **one missing word**, represented by a blank (___).
  - If the missing word is a **verb**, include the base form in brackets.  
  - Example: "He ___ (buy) a new phone recently."
- answer (string): The correct word or verb form that completes the sentence naturally and grammatically.
- explanation (string, optional): A short explanation of the correct answer. Write this in the **user’s native language**.

--------------------
Rules and Constraints:
--------------------
- Use **only one blank** per sentence.
- Sentences must be **realistic** and **moderately challenging**.
- Use brackets for verbs only when the user must apply the correct verb form.
- Do **not** use extra keys outside of "sentences".

`.trim()

    case TaskTypeEnum.MULTIPLE_CHOICE:
      return `
====================
OUTPUT FORMAT: MULTIPLE CHOICE
====================

Return a single valid JSON object with **one top-level key**: "sentences".

The "sentences" key must map to an array of exactly ${count} ${plural}.  
Each item must follow the structure below:

--------------------
Structure of Each Sentence Object:
--------------------
- id (number): A unique numeric ID (e.g., 1, 2).
- prompt (string): A sentence with one missing word.  
  - If testing **verb forms**, include the base verb in brackets.  
    - Example: "They ___ (watch) a movie last night."  
  - If testing **word choice**, no brackets needed.  
    - Example: "She ___ to go out in the rain."
- options (string[]): A list of 3–4 possible answers.  
  - Include **only one correct answer**.  
    - Example: ["watch", "watched", "watches"]
- answer (string): The correct answer. Must exactly match one of the options.
- explanation (string, optional): A short explanation of why the answer is correct. Write this in the **user’s native language**.

--------------------
Rules and Constraints:
--------------------
- Include **only one correct answer** per sentence.
- All options must be plausible and contextually appropriate.
- Sentences must reflect **realistic, moderately difficult usage**.
- Do **not** use extra keys outside of "sentences".

`.trim()

    default:
      throw new Error(`Unsupported task type: ${type}`)
  }
}

export function buildSystemPrompt(request: ITaskGeneratorRequest & { task_sentences_count: number }, prompt: IPromptScenario): string {
  const readableType = taskTypeReadable[request.type]
  const schemaInstructions = getReadableSchemaInstructions(request.type, request.task_sentences_count)

  const vocabBlock = prompt.user_content.dictionary.length ? prompt.user_content.dictionary.map((entry) => `- ${entry.word}: ${entry.meaning}`).join("\n") : "None"

  const expressionsBlock = prompt.user_content.phrases.length ? prompt.user_content.phrases.map((entry) => `- "${entry.phrase}"`).join("\n") : "None"

  return `
====================
SYSTEM ROLE
====================
You are an AI language assistant.

Your task is to generate a structured "${readableType}" language exercise focused **exclusively** on the topic:
**"${request.topic_title}"**

====================
TASK DIFFICULTY
====================
- The task should be moderately challenging — appropriate for intermediate learners.
- Avoid overly simple or excessively advanced structures.
- Focus on natural and realistic sentence constructions.

====================
LANGUAGE USAGE
====================
- All task content (sentence prompts and answer options) must be written in the **target language**: ${request.target_language}.
- All explanations (if included) must be written in the **user’s native language**: ${request.explanation_language}.

====================
SCENARIO CONTEXT (Optional)
====================
Use this background info only if clearly relevant to the topic.

- Scenario Title: ${prompt.title}
- Scenario Setting: ${prompt.model_behavior.scenario.setting}

Key Vocabulary:
${vocabBlock}

Useful Expressions:
${expressionsBlock}

====================
GENERATION INSTRUCTIONS
====================
- Generate **exactly ${request.task_sentences_count} sentence(s)** for the activity type: "${readableType}".
- Each sentence must directly support the topic: **"${request.topic_title}"**.
- Sentence content must reflect **real-life usage** and **moderate difficulty**.
- If a verb form is expected, include the **base verb in brackets** (e.g., "___ (go)").
- If the answer is not a verb form, do **not** use brackets (e.g., articles, prepositions, modals).
- Use vocabulary and expressions from the scenario **only** if they are clearly relevant.

====================
OUTPUT FORMAT
====================
Return a single valid **JSON object**. Do not include any extra text.

${schemaInstructions}

====================
ENDING INSTRUCTION
====================
Respond only with a valid JSON object. No preambles, no formatting, no explanations. Just the JSON.
`.trim()
}
