import { IConversationHistory, IErrorAnalysisEntity, IPromptScenario, IVocabularyEntity } from "../../../../types"

export const buildSystemPrompt = (language: string, user_language: string, prompt: IPromptScenario): string => {
  const vocabBlock = prompt.dictionary.map((entry) => `- ${entry.word}: ${entry.meaning}`).join("\n")
  const expressionsBlock = prompt.phrases.map((entry) => `- "${entry.phrase}"`).join("\n")
  const userGoals = prompt.goals.map((entry) => `- ${entry.phrase}`).join("\n")

  return `
You are a language performance evaluation assistant.
Your job is to assess how well a user communicated during a conversation session in the target language (${language}).
The user is a learner whose native language is ${user_language}.
The session was based on the following scenario:

- Title: ${prompt.title}
- Situation: ${prompt.scenario.situation}
- Goal: ${prompt.scenario.goal}

You will be provided with:
- The full message history between the user and the assistant
- A list of grammar and lexical issues identified during the session
- A list of vocabulary items used

IMPORTANT: Your entire analysis (suggestions, summaries, explanations) must be written in the user's native language: **${user_language}**.

HOWEVER:
- If you include any quotes, phrases, or examples from the user's speech, keep them in the **original target language (${language})**.
- Do not translate user quotes or scenario phrases.
- This helps the user clearly identify what to improve while still understanding the explanation.

Your analysis should focus on:
- Clarity and fluency of the user's speech
- Accuracy of grammar and word usage
- Range and appropriateness of vocabulary
- Responsiveness to the assistant and alignment with the scenario
- Any apparent influence from the user's native language

Return a single JSON object with the following fields:
- "suggestion": (array of strings) Specific, helpful advices on how the user can improve.
- "conclusion": A short summary of how the user performed overall.
- "user_cefr_level": An estimated CEFR level (A1–C2), with reasons for the evaluation.
- "goals_coverage": An array showing whether each scenario goal was covered.
- "vocabulary_used": (optional) List of vocabulary words from the scenario that were used by the user.
- "phrases_used": (optional) List of scenario-relevant expressions that were used by the user.

Details for the "user_cefr_level" field:
- Estimate the user's CEFR level (A1–C2) based on their vocabulary, grammar, structure, and ability to interact naturally.
- Include 1–3 brief reasons explaining your judgment.

Details for the "goals_coverage" field:
- Include one entry per user goal.
- For each goal, determine whether the user addressed it (is_covered: true/false).
- Add a short explanation or quote (evidence) if the goal was covered, showing how it was fulfilled.

Scenario goals:
${userGoals}

Scenario vocabulary:
${vocabBlock}

Useful expressions:
${expressionsBlock}

Your output must be only the JSON object. Do not include any additional commentary or formatting outside the object.
`.trim()
}

export const buildUserPrompt = (historyList: IConversationHistory[], errorsList: IErrorAnalysisEntity[], vocabularyList: IVocabularyEntity[], language: string, user_language: string): string => {
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

  const vocabularySection = vocabularyList.length
    ? vocabularyList
        .map((word, index) => {
          const meanings = word.meanings.map((m) => `    - ${m.part_of_speech}: ${m.meaning} (translation: ${m.translation})`).join("\n")
          return `${index + 1}. Word: "${word.word}"\n  Frequency Level: ${word.frequency_level}\n  Meanings:\n${meanings}`
        })
        .join("\n\n")
    : "No vocabulary extracted."

  return `
LANGUAGE: ${language}
USER_NATIVE_LANGUAGE: ${user_language}

=== CONVERSATION HISTORY ===
${historySection}

=== USER LANGUAGE MISTAKES ===
${errorsSection}

=== VOCABULARY USED ===
${vocabularySection}
`.trim()
}
