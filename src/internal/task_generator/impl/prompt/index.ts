import { IConversationHistory, IErrorAnalysisEntity, IPromptScenario, ITaskGeneratorRequest, TaskTypeEnum } from "../../../../types"

const taskTypeReadable: Record<TaskTypeEnum, string> = {
  FILL_BLANK: "Fill in the blanks",
  MULTIPLE_CHOICE: "Multiple choice",
}

export function getReadableSchemaInstructions(type: TaskTypeEnum, count: number): string {
  const plural = count > 1 ? "sentences" : "sentence"

  switch (type) {
    case TaskTypeEnum.FILL_BLANK:
      return `
You must return a JSON object with exactly ${count} ${plural} for a "fill in the blank" activity.

Each sentence must follow this structure:
- id (number): A unique number for the sentence (e.g., 1, 2).
- prompt (string): A sentence with one missing word, represented by a blank (e.g., "___").
  Example: "She ___ to the store every morning."
- answer (string): The correct word that fits the blank naturally and grammatically.
- explanation (string): A short explanation of why the word is correct.
  You may write this in the user's native language.

Only include one blank per sentence.
The sentences must reflect grammar or vocabulary issues the user previously struggled with.
`.trim()

    case TaskTypeEnum.MULTIPLE_CHOICE:
      return `
You must return a JSON object with exactly ${count} ${plural} for a "multiple choice" language activity.

Each sentence must follow this structure:

- id (number): A unique number for the question (e.g., 1, 2).
- prompt (string): A short sentence with one missing or incomplete word.
  Example: "They ___ a movie last night."
- options (array of strings): 3–4 possible answers. Include only one correct answer.
  Example: ["watch", "watched", "watches"]
- answer (string): The correct option (must match one of the items in "options").
- explanation (string): A short explanation of why the answer is correct.
  You may write this in the user's native language.

Make sure all options are realistic and appropriate for the user's level.
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

  const goalsBlock = prompt.goals.length ? prompt.goals.map((entry) => `- ${entry.phrase}`).join("\n") : "None"

  return `
You are an AI-powered language learning assistant.
Your task is to generate a structured "${readableType}" practice task for a user, based on mistakes they made in a previous speaking session.

Language context:
- Target language (used for all task content): ${request.target_language}
- User's native language (used for explanations only): ${request.user_language}

Scenario context:
- Title: ${prompt.title}
- Description: ${prompt.description}
- Setting: ${prompt.scenario.setting}
- Situation: ${prompt.scenario.situation}
- Speaking goal: ${prompt.scenario.goal}

User goals during the session:
${goalsBlock}

Key vocabulary from the scenario:
${vocabBlock}

Useful expressions from the scenario:
${expressionsBlock}

Instructions:
- Generate exactly ${request.task_sentences_count} task sentence(s).
- The sentences should reflect natural, conversational usage in the target language.
- All task content must be written in the target language (${request.target_language}).
- Explanations may be written in the user's native language (${request.user_language}).
- Use vocabulary or phrases from the scenario if they support the goal.

Mistake-based topic focus:
The user prompt includes structured error analysis.

If any "Topic" values are provided:
- Choose **only one topic** from the available ones
- Create all ${request.task_sentences_count} sentences to target that single topic
- Do not mix multiple topics across different sentences

If no topics are present:
- Choose one relevant grammar or vocabulary theme based on the scenario context (goal, situation, vocabulary)

For each sentence:
- If the user had grammar problems (e.g., verb tense, articles), make the blank or distractors reinforce correct structure
- If the user had vocabulary issues, use the correct word naturally in context
- In the "explanation" field, clearly refer to the topic you targeted
  Example: "This sentence reinforces the user's confusion between 'do' and 'does' (Topic: Present Simple)."

Response format:
${schemaInstructions}

IMPORTANT:
- Return a **single valid JSON object**.
- Do not include any extra commentary, formatting, or explanation — only the JSON object.
`.trim()
}

export const buildUserPrompt = (historyList: IConversationHistory[], errorsList: IErrorAnalysisEntity[], language: string, user_language: string): string => {
  const historySection = historyList.map((entry) => `[${entry.role.toUpperCase()} | ${entry.created_at.toISOString()}]: ${entry.content}`).join("\n")

  const errorsSection = errorsList.length
    ? errorsList
        .map((error, index) => {
          const issuesFormatted = error.issues
            .map((issue, i) => {
              return `  Issue ${i + 1}:
    Original: "${issue.original_text}"
    Corrected: "${issue.corrected_text}"
    Explanation: ${issue.explanation}
    Topic: ${issue.topic_titles}`
            })
            .join("\n")
          return `${index + 1}. Message: "${error.last_user_message}"\n${issuesFormatted}\n  Summary Comment: ${error.suggestion_message}`
        })
        .join("\n\n")
    : "No errors detected."

  return `
LANGUAGE: ${language}
USER_NATIVE_LANGUAGE: ${user_language}

=== CONVERSATION HISTORY ===
${historySection}

=== USER LANGUAGE MISTAKES ===
${errorsSection}
`.trim()
}
