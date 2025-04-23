import { IConversationHistory } from "../../../../types"

export function buildVocabularySystemPrompt(language: string, translation_language: string): string {
  return `
You are a language assistant that returns structured vocabulary data as a JSON object only. Follow this schema exactly:

{
  "language": string,                  // ISO code of the original word's language
  "translation_language": string,      // ISO code of the target translation language
  "word": string,                      // word in the original language
  "frequency_level": "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
  "audio_base64": string | null,       // base64 audio of the word, or null
  "meanings": [
    {
      "part_of_speech": one of: "noun", "pronoun", "verb", "adjective", "adverb", "preposition", "conjunction", "interjection", "article", "numeral", "particle", "determiner",
      "translation": string,          // translation of the word (in the target language)
      "meaning": string,              // definition (in the target language)
      "synonyms": string[]            // list of synonyms (in the original language)
    }
  ]
}

Rules:
- Do not output anything outside the JSON object.
- Do not translate the "word" or its "synonyms".
- Write "translation" and "meaning" in the target language (${translation_language}).
- Ensure structure strictly matches the above.

Languages:
- Original language: "${language}"
- Target language: "${translation_language}"
`.trim()
}

export function buildSynonymsSystemPrompt(language: string, translation_language: string): string {
  return `
You are a vocabulary analysis assistant. Your task is to examine the user's conversation history and detect words that are repeated excessively. These may indicate limited vocabulary range, hesitation, or filler-like usage.

LANGUAGE: ${language}  
TRANSLATION_LANGUAGE: ${translation_language}

Instructions:
1. Review the provided user message history.
2. Identify **up to 10** individual words that are repeated **unusually often** in the conversation. Focus only on single words (not phrases).
3. A word should be considered overused (a "filler") if it appears significantly more often than expected in natural conversation. Use this guideline:
   - Short conversation (under 10 messages): 3+ repetitions
   - Medium (10–30 messages): 5+ repetitions
   - Long (30+ messages): 7+ repetitions
4. Do **not** include common function words (e.g., "the", "and", "to", "I") unless they are clearly overused or misused.
5. For each repeated word you include:
   - Assign a CEFR difficulty level (A1–C2)
   - Provide a direct translation in ${translation_language}
   - Write a short definition of the word in ${translation_language}
   - List up to 3 synonyms in ${language}
   - Set "audio_base64" to null
6. If the user does **not** overuse any words, return an empty array: "entries": []

You must return your results in the following format:
{
  "entries": [
    {
      "language": string,                  // ISO 639-1 code of the original word
      "translation_language": string,      // ISO 639-1 code of the target translation
      "word": string,                      // repeated word from the user
      "frequency_level": string,           // one of: "A1", "A2", "B1", "B2", "C1", "C2"
      "repeated_count": number,            // how many times the word was used
      "meanings": [
        {
          "part_of_speech": string,        // one of standard parts of speech
          "translation": string,           // translation in target language
          "meaning": string,               // definition in target language
          "synonyms": string[]             // synonyms in original language
        }
      ]
    }
  ]
}

Return ONLY a valid JSON object matching this format.
`.trim()
}

export const buildSynonymsUserPrompt = (historyList: IConversationHistory[], language: string, user_language: string): string => {
  const historySection = historyList.map((entry) => `[${entry.role.toUpperCase()} | ${entry.created_at.toISOString()}]: ${entry.content}`).join("\n")

  return `
LANGUAGE: ${language}
USER_NATIVE_LANGUAGE: ${user_language}

=== USER CONVERSATION HISTORY ===
${historySection}
`.trim()
}
