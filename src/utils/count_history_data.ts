import { IConversationHistory, ICommunicationReviewHistory } from "../types"

export const countHistoryData = (historyList: IConversationHistory[]): ICommunicationReviewHistory => {
  if (!historyList || historyList.length === 0) {
    return {
      start_time: new Date(0),
      duration_seconds: 0,
      user_utterances_count: 0,
      model_utterances_count: 0,
      messages: historyList,
    }
  }

  const start_time = historyList.reduce((earliest, item) => (item.created_at < earliest ? item.created_at : earliest), historyList[0].created_at)

  const end_time = historyList.reduce((latest, item) => (item.updated_at > latest ? item.updated_at : latest), historyList[0].updated_at)

  const duration_seconds = Math.floor((end_time.getTime() - start_time.getTime()) / 1000)

  let user_utterances_count = 0
  let model_utterances_count = 0

  for (const entry of historyList) {
    if (entry.role === "user") {
      user_utterances_count++
    } else if (entry.role === "assistant") {
      model_utterances_count++
    }
  }

  return {
    start_time,
    duration_seconds,
    user_utterances_count,
    model_utterances_count,
    messages: historyList,
  }
}
