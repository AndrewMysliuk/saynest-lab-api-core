import { v4 as uuidv4 } from "uuid"
import fs from "fs"
import path from "path"
import { IConversationHistory } from "../types"

export const startNewSession = (system_prompt: string) => {
  const session_id = uuidv4()
  const sessionDir = path.join(__dirname, "../../user_sessions", session_id)
  fs.mkdirSync(sessionDir, { recursive: true })

  const conversationHistory: IConversationHistory[] = [{ id: uuidv4(), pairId: uuidv4(), role: "system", content: system_prompt }]

  return { session_id, sessionDir, conversationHistory }
}

export const getSessionData = (session_id: string | undefined, system_prompt: string) => {
  if (session_id) {
    const sessionDir = path.join(__dirname, "../../user_sessions", session_id)
    if (fs.existsSync(sessionDir)) {
      const conversationHistory: IConversationHistory[] = JSON.parse(fs.readFileSync(path.join(sessionDir, "history.json"), "utf-8"))
      return { session_id, sessionDir, conversationHistory }
    }
  }

  return startNewSession(system_prompt)
}
