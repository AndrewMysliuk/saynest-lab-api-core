import tiktoken from "tiktoken"

import { IConversationHistory, UserProgressTrendEnum } from "../types"

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

export function calculateStreak(log: Record<string, boolean>): number {
  const dates = new Set(Object.keys(log))
  let streak = 0
  const today = new Date()

  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().slice(0, 10)

    if (dates.has(key)) {
      streak++
    } else {
      break
    }
  }

  return streak
}

export function getTrend(prev: number | undefined, current: number): UserProgressTrendEnum {
  if (prev === undefined) return UserProgressTrendEnum.STABLE
  if (current > prev) return UserProgressTrendEnum.UP
  if (current < prev) return UserProgressTrendEnum.DOWN
  return UserProgressTrendEnum.STABLE
}
