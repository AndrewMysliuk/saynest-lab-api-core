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
You must return a JSON object with a top-level key "sentences", which maps to an array of exactly ${count} ${plural} for a "fill in the blank" activity.

Each item in the "sentences" array must be an object with the following structure:
- id (number): A unique numeric identifier for the sentence (e.g., 1, 2).
- prompt (string): A sentence with one missing word, represented by a blank. If the missing word is a verb that requires the user to apply a correct tense or form, include the base verb in brackets. Example: "He ___ (buy) a new phone recently."
- answer (string): The correct word or verb form that completes the sentence naturally and grammatically.
- explanation (string, optional): A short explanation of why the answer is correct. This may be written in the user's native language.

Important rules:
- Only include **one blank** per sentence.
- Make the sentences moderately challenging and realistic.
- Include verbs in brackets where appropriate to focus on grammar, not guessing.

Make sure the top-level object has only one key: "sentences".
`.trim()

    case TaskTypeEnum.MULTIPLE_CHOICE:
      return `
You must return a JSON object with a top-level key "sentences", which maps to an array of exactly ${count} ${plural} for a "multiple choice" language activity.

Each item in the "sentences" array must be an object with the following structure:

- id (number): A unique numeric identifier for the question (e.g., 1, 2).
- prompt (string): A sentence with a missing word. If testing verb forms, you may include the base verb in brackets to clarify what transformation is expected. Example (verb form): "They ___ (watch) a movie last night." Example (word choice): "She ___ to go out in the rain."
- options (array of strings): A list of 3–4 possible answers. Include **only one correct answer**. Example: ["watch", "watched", "watches"]
- answer (string): The correct answer. Must exactly match one of the items in "options".
- explanation (string, optional): A short explanation of why the answer is correct. You may write this in the user's native language.

Guidelines:
- Options must be plausible and appropriate to the context and user's level.
- Only include **one correct answer**.
- Sentences should reflect real-life usage and moderate difficulty.

Make sure the top-level object has only one key: "sentences".
`.trim()

    default:
      throw new Error(`Unsupported task type: ${type}`)
  }
}

export function buildSystemPrompt(request: ITaskGeneratorRequest & { task_sentences_count: number }, prompt: IPromptScenario): string {
  const readableType = taskTypeReadable[request.type]
  const schemaInstructions = getReadableSchemaInstructions(request.type, request.task_sentences_count)

  const vocabBlock = prompt.dictionary.length ? prompt.dictionary.map((entry) => `- ${entry.word}: ${entry.meaning}`).join("\n") : "None"
  const expressionsBlock = prompt.phrases.length ? prompt.phrases.map((entry) => `- "${entry.phrase}"`).join("\n") : "None"

  return `
You are an AI language assistant.

Generate a structured "${readableType}" practice task focused **exclusively** on the following topic:
"${request.topic_title}"

Task difficulty should be moderate — not suitable for absolute beginners, but also not too advanced. Aim for realistic and slightly challenging content that reinforces common patterns and promotes active recall.

Language usage:
- Write **all task content** in the target language: ${request.target_language}
- Write **all explanations** (if applicable) in the user's native language: ${request.explanation_language}

Use the following scenario information **only if relevant** to the topic:

Scenario context:
- Title: ${prompt.title}
- Setting: ${prompt.scenario.setting}

Key vocabulary:
${vocabBlock}

Useful expressions:
${expressionsBlock}

Instructions:
- Generate exactly ${request.task_sentences_count} sentence(s) for the activity type "${readableType}".
- Focus on the topic: **"${request.topic_title}"**. All sentences must directly support this topic.
- Sentences should reflect realistic, natural usage in ${request.target_language}, with **moderate difficulty** — avoid overly simple constructions.
- If the task requires the user to transform a verb into the correct tense or form, include the base verb in brackets (e.g., "___ (go)").
- Do not use brackets if the correct answer is simply a specific word (e.g., a modal, article, or preposition).
- Use vocabulary and expressions from the scenario only if they are clearly relevant and helpful for the topic.

Response format:
${schemaInstructions}

IMPORTANT:
- Return a **single valid JSON object**.
- Do not include any extra commentary, formatting, or explanation — only the JSON object.
`.trim()
}
