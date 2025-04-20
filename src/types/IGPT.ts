export type GPTModelType = "gpt-4-turbo" | "gpt-4" | "gpt-4o" | "gpt-4.1"

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
