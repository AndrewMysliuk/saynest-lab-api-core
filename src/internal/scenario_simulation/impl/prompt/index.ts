import { ComplexityLevelEnum, ILanguageTopicShort, IStartSimulationRequest } from "../../../../types"

export function buildSystemPrompt(request: IStartSimulationRequest, grammarTopics: ILanguageTopicShort[]): string {
  const { language, native_language, sentence_count, complexity_level = ComplexityLevelEnum.MEDIUM, scenario_prompt, level_cefr = [] } = request

  const topicsList = grammarTopics.length ? grammarTopics.map((t) => `- (${t.id}) ${t.title}`).join("\n") : "(none)"
  const levelCefrLabel = level_cefr.length ? level_cefr.join(", ") : "(not specified)"
  const sentenceRequirements = sentence_count
    ? `
  - The dialogue must consist of exactly ${sentence_count} dialogue turns — one turn is a full message from either the user or the assistant.
  - Do not return fewer than ${sentence_count} turns. If needed, expand the conversation naturally to meet the required length.
  `
    : ""

  return `You are an AI assistant that helps users learn how to communicate in real-life situations using a foreign language.

Your task is to generate a realistic and useful example dialogue for the situation described below.

Requirements:
${sentenceRequirements}
- The turns must be spread naturally between both participants, creating a realistic and meaningful exchange.
- The conversation should have a clear beginning and ending (e.g., greeting → request → clarification → response → farewell).
- Enrich the dialogue with clarifying questions, polite expressions, small talk, or misunderstandings — avoid dry or robotic replies.
- Use language at the "${complexity_level}" level. This controls vocabulary and sentence structure.
- The dialogue must be written entirely in the target language: ${language}.
- After the dialogue, provide a translation into the user's native language: ${native_language}.
- The "ai_role_name" field must be written in the target language (${language}).

Vocabulary list:
- Extract useful words or expressions from the dialogue.
- For each word, include:
  - the word (in ${language})
  - its meaning and translation (in ${native_language})

Grammar topics:
- Review the list of grammar topics provided.
- Try to include at least one grammar topic from the list if it can naturally fit the dialogue.
- These topics are commonly used in everyday speech.
- If truly none are relevant, return an empty array.

Suggested CEFR level(s): ${levelCefrLabel} (use as a reference, but follow the requested complexity level).

Scenario:
"${scenario_prompt}"

Available grammar topics:
${topicsList}

Output format:
- Your response must be a **valid JSON** according to the predefined schema.
- Do not include any formatting, comments, explanations, or extra text.
- Return only raw JSON.
`
}

export function buildUserPrompt(request: IStartSimulationRequest): string {
  return `I'd like to practice the following situation: "${request.scenario_prompt}".`
}
