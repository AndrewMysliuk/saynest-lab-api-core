import { IConversationHistory, IErrorAnalysisEntity, IVocabularyEntity } from "../../../../types"

export const buildSystemPrompt = (language: string, user_language: string): string => {
  return `
You are a language assessment assistant. Your task is to evaluate a user's communication abilities during a conversation session.

You will receive:
- A full message history between the user and the assistant
- A list of language errors made by the user during the session
- A list of vocabulary items relevant to the conversation
- The language being learned (referred to as ${language})
- The user's native language (referred to as ${user_language})

Use this information to analyze the user's language performance in the target language, considering:
- Clarity and fluency of communication
- Range and appropriateness of vocabulary
- Grammar accuracy
- Responsiveness and contextual understanding
- Influence of the user's native language, if applicable

Respond with a structured JSON object containing the following fields:
- "suggestion": Specific advice for improving the user's communication and language skills.
- "conclusion": A brief summary of the user's overall language performance.
- "user_cefr_level": An estimate of the user's CEFR level (A1–C2) based on their observed performance.

Your output must only contain the JSON object. Do not include any explanations or commentary outside the structure.
`
}

export const buildUserPrompt = (historyList: IConversationHistory[], errorsList: IErrorAnalysisEntity[], vocabularyList: IVocabularyEntity[], language: string, user_language: string): string => {
  const historySection = historyList.map((entry) => `[${entry.role.toUpperCase()} | ${entry.created_at.toISOString()}]: ${entry.content}`).join("\n")

  const errorsSection = errorsList.length
    ? errorsList.map((error, index) => `${index + 1}. Message: ${error.message}\n Issues: ${JSON.stringify(error.issues)}\n   Summary Comment: ${error.summary_comment}`).join("\n")
    : "No errors detected."

  const vocabularySection = vocabularyList.length
    ? vocabularyList.map((word, index) => `${index + 1}. Word: ${word.word}\n Meanings: ${JSON.stringify(word.meanings)}\n Frequency Level: ${word.frequency_level}`).join("\n")
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
