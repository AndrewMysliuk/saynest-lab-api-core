import { IConversationHistory, IErrorAnalysisEntity, IPromptScenarioEntity } from "../../../../types"

export const buildSystemPrompt = (target_language: string, explanation_language: string, prompt: IPromptScenarioEntity): string => {
  const vocabBlock = prompt.user_content.dictionary.map((entry) => `- ${entry.word}: ${entry.meaning}`).join("\n")
  const expressionsBlock = prompt.user_content.phrases.map((entry) => `- "${entry.phrase}"`).join("\n")
  const userGoals = prompt.user_content.goals.map((entry) => `- ${entry.phrase}`).join("\n")

  return `
You are a language performance evaluation assistant.
Your job is to assess how well a user communicated during a conversation session in the target language (${target_language}).
The user is a learner whose native language is ${explanation_language}.
The session was based on the following scenario:

- Title: ${prompt.title}
- Situation: ${prompt.model_behavior.scenario!.situation}
- Goal: ${prompt.model_behavior.scenario!.goal}

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

Details for the "consistency_review" field:
- This field evaluates how consistently the user responded to the assistant’s questions.
- "consistency_score" is a number between 0 and 100. A higher score means most answers were relevant and aligned with the questions. A lower score indicates frequent digressions, off-topic replies, or irrelevant answers.
- "summary" is a short explanation (in ${explanation_language}) describing how consistent the user was during the session.
- "inconsistent_turns" is a list of problematic responses. For each, include:
  - "question": the assistant's original question,
  - "user_response": the user's answer,
  - "comment": a short explanation (in ${explanation_language}) of why the response was off-topic or irrelevant.
- Only include entries that are clearly inconsistent. Do not nitpick minor misunderstandings or acceptable creative interpretation.

Scenario goals:
${userGoals}

Scenario vocabulary:
${vocabBlock}

Useful expressions:
${expressionsBlock}

Your output must be only the JSON object. Do not include any additional commentary or formatting outside the object.
`.trim()
}

export const buildIELTSSystemPrompt = (target_language: string, explanation_language: string, prompt: IPromptScenarioEntity): string => {
  const scenario = prompt.model_behavior.ielts_scenario!
  const { part1, part2, part3 } = scenario

  const part1Block = part1.topics.map((t, i) => `Topic ${i + 1}: ${t.title}\n${t.questions.map((q) => `- ${q}`).join("\n")}`).join("\n\n")

  const part2Block = [`${part2.question}`, `You should say:`, ...part2.bullet_points.map((p) => `- ${p}`)].join("\n")

  const part3Block = part3.topics.map((t, i) => `Topic ${i + 1}: ${t.title}\n${t.questions.map((q) => `- ${q}`).join("\n")}`).join("\n\n")

  return `
You are an official IELTS Speaking assessment assistant.

You must strictly evaluate the user's speaking performance based on the **IELTS Speaking Band Descriptors**. Be critical and realistic — this is **exam preparation**, not casual conversation feedback.

LANGUAGE CONTEXT:
- Target language: ${target_language}
- User’s native language (for explanation): ${explanation_language}

AVAILABLE DATA:
- The full message history of the speaking session
- Grammar and vocabulary errors (auto-detected)
- The structure followed: IELTS Speaking Parts 1–3

YOUR TASK:
- Provide honest, detailed feedback to help the user **improve and calibrate their expectations**
- Use only the user’s native language (**${explanation_language}**) for comments
- When quoting examples from the user’s answers — **leave them in ${target_language}**
- Return your analysis as a single **valid JSON object** — no extra text

SCORING RULES:
- Band 9: native-like fluency, very rare mistakes
- Band 7: some errors, but natural and effective communication
- Band 6: noticeable errors in grammar/lexis, limited flexibility
- Band 5: frequent errors, simple structures, unclear ideas
- Band 4 and below: communication breaks down

DO NOT inflate the scores. If the user had frequent lexical or grammatical errors, give a **realistic band (5 or below)**. Fluency means smooth, coherent, and confident delivery — not just “not pausing”.

OUTPUT FORMAT:

{
  "suggestion": [string],               // concrete advice (e.g. "Practice linking ideas with connectors")
  "conclusion": string,                 // short overall summary in user's native language
  "user_ielts_mark": number,            // overall band (e.g. 5.5)
  "band_breakdown": {
    "fluency": number,
    "lexical": number,
    "grammar": number
  },
  "part1": {
    "summary": string,
    "highlights": [string] (optional)
  },
  "part2": {
    "summary": string,
    "highlights": [string] (optional)
  },
  "part3": {
    "summary": string,
    "highlights": [string] (optional)
  }
}

Do not include markdown, formatting, or comments outside the JSON.

=== IELTS SCENARIO REFERENCE ===

PART 1 – INTRODUCTION & INTERVIEW
${part1Block}

PART 2 – LONG TURN
${part2Block}

PART 3 – DISCUSSION
${part3Block}
`.trim()
}

export const buildUserPrompt = (historyList: IConversationHistory[], errorsList: IErrorAnalysisEntity[], target_language: string, explanation_language: string): string => {
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
    Topics: ${issue.topic_titles.join(", ")}`
            })
            .join("\n")

          return `${index + 1}. Message: "${error.last_user_message}"\n${issuesFormatted}\n  Summary Comment: ${error?.improve_user_answer?.explanation}`
        })
        .join("\n\n")
    : "No errors detected."

  return `
LANGUAGE: ${target_language}
USER_NATIVE_LANGUAGE: ${explanation_language}

=== CONVERSATION HISTORY ===
${historySection}

=== USER LANGUAGE MISTAKES ===
${errorsSection}
`.trim()
}
