import { ILanguageTopicShort, ITaskGeneratorRequest, TaskTypeEnum } from "../../../../types"

const taskTypeReadable: Record<TaskTypeEnum, string> = {
  FILL_BLANK: "Fill in the blanks",
  MATCH_TRANSLATION: "Match translation",
  REORDER_WORDS: "Reorder words",
  MULTIPLE_CHOICE: "Multiple choice",
  CORRECT_SENTENCE: "Correct the sentence",
  LISTEN_AND_TYPE: "Listen and type",
}

function getSchemaInstructionByType(type: TaskTypeEnum, sentenceCount: number): string {
  switch (type) {
    case TaskTypeEnum.FILL_BLANK:
      return `
You MUST return exactly ${sentenceCount} separate sentence objects inside the "sentences" array.

Each object in "sentences" must contain:
• "sentence_with_blanks": the sentence with one or more '___' as blanks.
• "correct_answers": an array of correct words, in left-to-right order.
• "options": an array of arrays. Each inner array must contain 3 or more answer choices for the corresponding blank, including the correct one.
• "explanation": optional explanation for the sentence.

⚠️ Do not add extra fields.
⚠️ Do not return fewer than ${sentenceCount} sentences — this is critical.`
    default:
      return ""
  }
}

export function buildSystemPrompt(request: ITaskGeneratorRequest, topics: ILanguageTopicShort[]): string {
  const { type, context, sandbox_prompt, sentence_count = 5, blank_count = 1, language, native_language, level_cefr } = request

  const readableType = taskTypeReadable[type]
  const contextPart = context ? `This task MUST be set in the context of: "${context}".` : ""
  const sandboxPart = sandbox_prompt ? `The user provided this learning goal: "${sandbox_prompt}".` : ""
  const blankCountPart = type === TaskTypeEnum.FILL_BLANK ? `Each sentence MUST contain exactly ${blank_count} blank(s), represented as '___'.` : ""
  const difficultyPart = level_cefr?.length ? `You MUST follow these CEFR level(s): ${level_cefr.join(", ")}. Use grammar, vocabulary, and sentence structures appropriate for these levels.` : ""

  const availableTopicsPart =
    topics.length > 0
      ? `If suitable, include grammar topics from: ${topics.map((t) => `"${t.title}"`).join(", ")}.`
      : `No specific grammar topics were selected, so you may choose appropriate ones for the level.`

  const schemaInstruction = getSchemaInstructionByType(type, sentence_count)

  return `
You are a task generator for language learners. Your job is to produce a list of "${readableType}" tasks as JSON that EXACTLY matches the schema provided.

Target language: ${language} — All tasks MUST be written **in this language**.
User’s native language: ${native_language} — Use **this language** for translations, explanations, or instructions intended for the user.

${difficultyPart}
You MUST return exactly ${sentence_count} separate sentences as a JSON array.
Each sentence must follow the "${readableType}" format.
${blankCountPart}

${availableTopicsPart}
${contextPart}
${sandboxPart}

${schemaInstruction}

The ONLY output must be a valid JSON object that strictly follows the schema.
❗ NO extra text, NO comments, NO explanations.
❗ Do NOT wrap the JSON in markdown or code blocks.
❗ If fewer than ${sentence_count} sentences are returned — the task is considered invalid.
`.trim()
}

export function buildUserPrompt(request: ITaskGeneratorRequest): string {
  const { topic_titles, context, level_cefr, sandbox_prompt } = request

  if (sandbox_prompt) return sandbox_prompt

  const topics = topic_titles?.length ? `Generate a task that focuses on the topic(s): ${topic_titles.join(", ")}.` : ""

  const lifeContext = context ? `The task should take place in the real-life context of: ${context}.` : ""

  const level = level_cefr?.length ? `The task should match CEFR level(s): ${level_cefr.join(", ")}.` : ""

  return [topics, lifeContext, level].filter(Boolean).join(" ")
}
