import tiktoken from "tiktoken"

import { GPTRoleType, IConversationHistory } from "../types"

const SAFETY_BUFFER = 3000

export const trimConversationHistory = (conversationHistory: IConversationHistory[], max_tokens: number, currentPairId: string): IConversationHistory[] => {
  const encoding = tiktoken.get_encoding("cl100k_base")

  const systemPrompt = conversationHistory[0]
  const history = conversationHistory.slice(1)

  const currentPairMessages: IConversationHistory[] = []
  const pairs: { user?: IConversationHistory; assistant?: IConversationHistory; tokens: number }[] = []

  for (const msg of history) {
    const tokens = encoding.encode(msg.content).length
    ;(msg as any)._tokens = tokens

    if (msg.pair_id === currentPairId) {
      currentPairMessages.push(msg)
      continue
    }

    const lastPair = pairs[pairs.length - 1]

    if (msg.role === "user") {
      pairs.push({ user: msg, tokens })
    } else if (msg.role === "assistant" && lastPair && !lastPair.assistant) {
      lastPair.assistant = msg
      lastPair.tokens += tokens
    }
  }

  const result: IConversationHistory[] = []
  let totalTokens = encoding.encode(systemPrompt.content).length

  for (let i = pairs.length - 1; i >= 0; i--) {
    const { user, assistant, tokens } = pairs[i]
    if (totalTokens + tokens > max_tokens - SAFETY_BUFFER) break

    if (assistant) result.unshift(assistant)
    if (user) result.unshift(user)
    totalTokens += tokens
  }

  return [systemPrompt, ...result, ...currentPairMessages]
}

export const trimmedMessageHistoryForErrorAnalyser = (messages: Array<{ role: GPTRoleType; content: string }>) => {
  const first = messages[0]
  const lastUser = [...messages].reverse().find((msg) => msg.role === "user")

  if (first.role === "system" && lastUser) {
    return [first, lastUser]
  }

  return []
}
