export type GPTModelType = "gpt-4-turbo" | "gpt-4" | "gpt-4o" | "gpt-4o-mini"

export type GPTRoleType = "user" | "system" | "assistant"

export interface IGPTPayload {
  model: GPTModelType
  messages?: Array<{ role: GPTRoleType; content: string }>
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

export interface ITextAnalysisResponse {
  detected_language: string
  is_target_language: boolean
  topic: string
  subtopics: string[]
  keywords: string[]
  sentence_structure: "simple" | "compound" | "complex"
  comment_to_user?: string
  reply_to_user: string
}
