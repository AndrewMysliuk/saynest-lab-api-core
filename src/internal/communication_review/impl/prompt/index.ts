import { IConversationHistory, IErrorAnalysisEntity, IPromptScenario, IVocabularyFillersEntity } from "../../../../types"

export const buildSystemPrompt = (target_language: string, explanation_language: string, prompt: IPromptScenario): string => {
  const vocabBlock = prompt.dictionary.map((entry) => `- ${entry.word}: ${entry.meaning}`).join("\n")
  const expressionsBlock = prompt.phrases.map((entry) => `- "${entry.phrase}"`).join("\n")
  const userGoals = prompt.goals.map((entry) => `- ${entry.phrase}`).join("\n")

  return `
You are a language performance evaluation assistant.
Your job is to assess how well a user communicated during a conversation session in the target language (${target_language}).
The user is a learner whose native language is ${explanation_language}.
The session was based on the following scenario:

- Title: ${prompt.title}
- Situation: ${prompt.scenario.situation}
- Goal: ${prompt.scenario.goal}

You will be provided with:
- The full message history between the user and the assistant
- A list of grammar and lexical issues identified during the session
- A list of vocabulary items used

IMPORTANT: Your entire analysis (suggestions, summaries, explanations) must be written in the user's native language: **${explanation_language}**.

HOWEVER:
- If you include any quotes, phrases, or examples from the user's speech, keep them in the **original target language (${target_language})**.
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
- Estimate the user's CEFR level (A1–C2) based on a holistic evaluation of:
  - Clarity (how understandable the user's speech is)
  - Fluency (how smoothly and naturally the user speaks)
  - Responsiveness (how appropriately and effectively the user responds)
  - Vocabulary range and appropriateness (especially use of scenario vocabulary and expressions)
  - Grammar and structure accuracy
- Focus primarily on Clarity, Fluency, and Responsiveness to determine the core CEFR estimate.
- Use vocabulary control and grammatical accuracy only to slightly adjust the core level up or down if they have a strong impact on communication.
- A few grammar mistakes should not significantly lower the CEFR level if overall communication is clear, fluent, and responsive.
- Include 1–3 brief reasons justifying your judgment, mentioning both strengths and weaknesses when necessary.

Details for the "goals_coverage" field:
- For each goal listed below, return one object.
- Determine if the user fulfilled the goal (is_covered: true or false).
- If true, provide a short quote or summary from the user's speech showing that the goal was met. If false, leave quote_from_dialogue as an empty string.

Details for the "vocabulary_used" field:
- For each vocabulary word listed below, return one object.
- Check if the user said this word or an obvious form of it (e.g. "manage" and "managing").
- Set is_used: true if the word was clearly used in context.
- If true, include a short quote from the dialogue that contains the word.
- If not used, set is_used: false and leave quote_from_dialogue as an empty string.

Details for the "phrases_used" field:
- For each phrase listed below, return one object.
- Check if the user said this phrase or something very close in meaning and form.
- Set is_used: true only if the phrase was clearly spoken and relevant.
- Provide a short quote from the dialogue if the phrase was used.
- If the phrase was not used, set is_used: false and leave quote_from_dialogue as an empty string.

Scenario goals:
${userGoals}

Scenario vocabulary:
${vocabBlock}

Useful expressions:
${expressionsBlock}

Your output must be only the JSON object. Do not include any additional commentary or formatting outside the object.
`.trim()
}

export const buildUserPrompt = (
  historyList: IConversationHistory[],
  errorsList: IErrorAnalysisEntity[],
  vocabularyList: IVocabularyFillersEntity[],
  target_language: string,
  explanation_language: string,
): string => {
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

          return `${index + 1}. Message: "${error.last_user_message}"\n${issuesFormatted}\n  Summary Comment: ${error?.improve_user_answer?.explanation}`
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
LANGUAGE: ${target_language}
USER_NATIVE_LANGUAGE: ${explanation_language}

=== CONVERSATION HISTORY ===
${historySection}

=== USER LANGUAGE MISTAKES ===
${errorsSection}

=== VOCABULARY USED ===
${vocabularySection}
`.trim()
}
