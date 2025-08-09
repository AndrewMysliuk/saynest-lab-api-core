export type GPTModelType = "gpt-5" | "gpt-4o"

export type GPTRoleType = "user" | "system" | "assistant"

export interface IGPTPayload {
  model: GPTModelType
  messages?: Array<{ role: GPTRoleType; content: string }>
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

export interface IGPTConversationRequest {
  gpt_payload: IGPTPayload
  prompt_id: string
}
