import tiktoken from "tiktoken"

import { GPTRoleType, IConversationHistory } from "../types"

const SAFETY_BUFFER = 3000

export const trimConversationHistory = (conversationHistory: IConversationHistory[], max_tokens: number, currentPairId: string): IConversationHistory[] => {
  const encoding = tiktoken.get_encoding("cl100k_base")

  const systemPrompt = conversationHistory[0]
  let history = conversationHistory.slice(1)

  let totalTokens = encoding.encode(systemPrompt.content).length
  const preserved: IConversationHistory[] = []
  const pairs: { user?: IConversationHistory; assistant?: IConversationHistory }[] = []

  for (let i = 0; i < history.length; i++) {
    const msg = history[i]
    if (msg.pair_id === currentPairId) {
      preserved.push(msg)
      continue
    }

    const lastPair = pairs[pairs.length - 1]
    if (msg.role === "user") {
      pairs.push({ user: msg })
    } else if (msg.role === "assistant" && lastPair && !lastPair.assistant) {
      lastPair.assistant = msg
    } else {
      preserved.push(msg)
    }
  }

  const result: IConversationHistory[] = []

  for (let i = pairs.length - 1; i >= 0; i--) {
    const pair = pairs[i]
    const pairTokens = (pair.user ? encoding.encode(pair.user.content).length : 0) + (pair.assistant ? encoding.encode(pair.assistant.content).length : 0)

    const softLimit = max_tokens - SAFETY_BUFFER

    if (totalTokens + pairTokens > softLimit) break

    if (pair.assistant) result.unshift(pair.assistant)
    if (pair.user) result.unshift(pair.user)
    totalTokens += pairTokens
  }

  const finalHistory = [systemPrompt, ...result, ...preserved.filter((m) => m.pair_id === currentPairId)]

  return finalHistory
}

export const trimmedMessageHistoryForErrorAnalyser = (messages: Array<{ role: GPTRoleType; content: string }>) => {
  const first = messages[0]
  const lastUser = [...messages].reverse().find((msg) => msg.role === "user")

  if (first.role === "system" && lastUser) {
    return [first, lastUser]
  }

  return []
}
