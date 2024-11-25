import { FunctionParameters } from "openai/src/resources/index.js"

export type GPTModelType = "gpt-4-turbo" | "gpt-4" | "gpt-4o" | "gpt-4o-mini"

export type GPTRoleType = "user" | "system" | "assistant"

export interface IGPTPayload {
  model: GPTModelType
  messages?: Array<{ role: GPTRoleType; content: string }>
  temperature?: number
  max_tokens?: number
  stream?: boolean
  jsonSchema: FunctionParameters
}
