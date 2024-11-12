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

export const trimConversationHistory = async (
  sessionId: string,
  max_tokens: number,
  currentPairId: string
): Promise<IConversationHistory[]> => {
  const history = await historyRepository.getHistoryBySession(sessionId)

  if (history.length === 0) return []

  const systemPrompt = history[0]
  let trimmedHistory = history.slice(1)

  while (countTokens([systemPrompt, ...trimmedHistory]) > max_tokens && trimmedHistory.length > 1) {
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
      await historyRepository.deleteHistoryByPairId(sessionId, pairId)
      trimmedHistory.splice(Math.min(userIndex, assistantIndex), 2)
    } else {
      await historyRepository.deleteHistoryById(sessionId, userMessage.id!)
      trimmedHistory.splice(userIndex, 1)
    }
  }

  return [systemPrompt, ...trimmedHistory]
}
