import { v4 as uuidv4 } from "uuid"
import fs from "fs"
import path from "path"
import { HistoryRepository } from "../repositories/conversationRepository"

const historyRepository = new HistoryRepository()

export const startNewSession = async (system_prompt: string) => {
  const session_id = uuidv4()
  const sessionDir = path.join(__dirname, "../../user_sessions", session_id)
  fs.mkdirSync(sessionDir, { recursive: true })

  const pairId = uuidv4()
  const conversationHistory = await historyRepository.saveHistory({
    sessionId: session_id,
    pairId,
    role: "system",
    content: system_prompt,
  })

  return { session_id, sessionDir, conversationHistory }
}

export const getSessionData = async (session_id: string | undefined, system_prompt: string) => {
  if (session_id) {
    const sessionDir = path.join(__dirname, "../../user_sessions", session_id)
    if (fs.existsSync(sessionDir)) {
      const conversationHistory = await historyRepository.getHistoryBySession(session_id)
      return { session_id, sessionDir, conversationHistory }
    }
  }

  return startNewSession(system_prompt)
}
