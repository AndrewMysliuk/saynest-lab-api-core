import { IConversationHistory } from "../types"

export const convertMessageToString = (message: string | ArrayBuffer | Buffer | Buffer[]): string => {
  if (typeof message === "string") {
    return message
  }

  if (Buffer.isBuffer(message)) {
    return message.toString()
  }

  if (message instanceof ArrayBuffer) {
    return Buffer.from(message).toString()
  }

  if (Array.isArray(message)) {
    return Buffer.concat(message).toString()
  }

  return ""
}

const calculateTotalTokens = (history: IConversationHistory[]): number => {
  return history.reduce((acc, message) => acc + calculateTokens(message.content), 0)
}

const calculateTokens = (content: string): number => {
  return Math.ceil(content.length / 4)
}

export const trimConversationHistory = (conversationHistory: IConversationHistory[], maxTokens: number): IConversationHistory[] => {
  let totalTokens = calculateTotalTokens(conversationHistory)

  if (totalTokens <= maxTokens) return conversationHistory

  const trimmedHistory = [...conversationHistory]

  for (let i = trimmedHistory.length - 1; i > 0; i -= 2) {
    if (totalTokens <= maxTokens) break

    if (i - 1 > 0) {
      totalTokens -= calculateTokens(trimmedHistory[i].content) + calculateTokens(trimmedHistory[i - 1].content)
      trimmedHistory.splice(i - 1, 2)
    }
  }

  return trimmedHistory
}
