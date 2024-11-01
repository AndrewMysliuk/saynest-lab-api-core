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

export const trimConversationHistory = (conversationHistory: IConversationHistory[], maxTokens: number) => {
  const estimateTokens = (text: string) => Math.ceil(text.length / 4)

  let totalTokens = conversationHistory.reduce((acc, message) => acc + estimateTokens(message.content), 0)

  if (totalTokens <= maxTokens) {
    return conversationHistory
  }

  // System Prompt Always First
  let tokenCount = estimateTokens(conversationHistory[0].content)
  let trimmedHistory = [conversationHistory[0]]

  for (let i = 1; i < conversationHistory.length; i++) {
    const message = conversationHistory[i]
    const messageTokens = estimateTokens(message.content)

    if (tokenCount + messageTokens <= maxTokens) {
      trimmedHistory.push(message)
      tokenCount += messageTokens
    } else {
      break
    }
  }

  return trimmedHistory
}
