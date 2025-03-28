import { ITaskGeneratorRequest, TaskTypeEnum } from "../../../../types"

const taskTypeReadable: Record<TaskTypeEnum, string> = {
  FILL_BLANK: "Fill in the blanks",
  MATCH_TRANSLATION: "Match translation",
  REORDER_WORDS: "Reorder words",
  MULTIPLE_CHOICE: "Multiple choice",
  CORRECT_SENTENCE: "Correct the sentence",
  FREE_ANSWER: "Free answer",
  LISTEN_AND_TYPE: "Listen and type",
}

export function buildSystemPrompt(request: ITaskGeneratorRequest): string {
  const { type, topic_titles, context, sandbox_prompt, sentence_count = 1, blank_count = 1, language, native_language } = request

  const readableType = taskTypeReadable[type]
  const titlePart = topic_titles?.length ? `The task must relate to the following topics: ${topic_titles.join(", ")}.` : ""
  const contextPart = context ? `This task should be set in the context of: "${context}".` : ""
  const sandboxPart = sandbox_prompt ? `The user provided this as their learning intention: "${sandbox_prompt}".` : ""
  const blankCountPart = type === TaskTypeEnum.FILL_BLANK ? `Generate exactly ${blank_count} blank(s) per sentence.` : ""

  return `
You are an AI language assistant generating language learning tasks of type: ${readableType}.

Target language: ${language}.
User’s native language: ${native_language}.

You must generate task, each containing ${sentence_count} ${readableType.toLowerCase()} sentence(s).
${titlePart}
${contextPart}
${sandboxPart}
${blankCountPart}

The response must be a valid JSON array of objects that match the provided JSON Schema. Do not include any explanations, formatting, or extra text. No comments. No additional fields. Only raw JSON.

Always respect the schema structure exactly — this is important for programmatic parsing.

Make the task relevant, educational, and level-appropriate.
`
}

export function buildUserPrompt(request: ITaskGeneratorRequest): string {
  const { topic_titles, context, level_cefr, sandbox_prompt } = request

  if (sandbox_prompt) return sandbox_prompt

  const topics = topic_titles?.length ? `Generate a task that focuses on the topic(s): ${topic_titles.join(", ")}.` : ""

  const lifeContext = context ? `The task should take place in the real-life context of: ${context}.` : ""

  const level = level_cefr?.length ? `The task should match CEFR level(s): ${level_cefr.join(", ")}.` : ""

  return [topics, lifeContext, level].filter(Boolean).join(" ")
}
