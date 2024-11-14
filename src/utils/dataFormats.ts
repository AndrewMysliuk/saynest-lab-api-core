import tiktoken from "tiktoken"
import { HistoryRepository } from "../repositories/conversationRepository"
import { IConversationHistory } from "../models/conversationModel"

const historyRepository = new HistoryRepository()

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

const countTokens = (history: IConversationHistory[]): number => {
  const encoding = tiktoken.get_encoding("cl100k_base")
  return history.reduce((acc, message) => acc + encoding.encode(message.content).length, 0)
}

export const trimConversationHistory = (
  conversationHistory: IConversationHistory | IConversationHistory[],
  max_tokens: number,
  currentPairId: string
): IConversationHistory[] => {
  const historyArray = Array.isArray(conversationHistory) ? conversationHistory : [conversationHistory]

  console.log("historyArray: ", historyArray)

  if (historyArray.length === 0) return []

  const systemPrompt = historyArray[0]
  let trimmedHistory = historyArray.slice(1)

  console.log("countTokens([systemPrompt, ...trimmedHistory]): ", countTokens([systemPrompt, ...trimmedHistory]))

  while (countTokens([systemPrompt, ...trimmedHistory]) > max_tokens && trimmedHistory.length > 1) {
    console.log("DEBUG WHILE")
    const lastUserIndex = trimmedHistory
      .map((message, index) => ({ message, index }))
      .reverse()
      .find(({ message }) => message.role === "user" && message.pairId !== currentPairId)

    if (!lastUserIndex) break

    const { index: userIndex, message: userMessage } = lastUserIndex
    const pairId = userMessage.pairId
    const assistantIndex = trimmedHistory.findIndex(
      (message, idx) => message.role === "assistant" && message.pairId === pairId && idx > userIndex
    )

    if (assistantIndex !== -1) {
      trimmedHistory.splice(Math.min(userIndex, assistantIndex), 2)
    } else {
      trimmedHistory.splice(userIndex, 1)
    }
  }

  return [systemPrompt, ...trimmedHistory]
}
