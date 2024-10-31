import { openaiREST } from "../config"
import fs from "fs"
import logger from "../utils/logger"
import { ITTSPayload } from "../types"
import * as path from "path"

export const ttsTextToSpeech = async (payload: ITTSPayload) => {
  const userSessionsDir = path.join(process.cwd(), "user_sessions")
  const fileExtension = payload?.response_format || "wav"
  const filePath = path.join(userSessionsDir, `${Date.now()}-model-response.${fileExtension}`)

  try {
    if (!fs.existsSync(userSessionsDir)) {
      await fs.promises.mkdir(userSessionsDir, { recursive: true })
    }

    const audio = await openaiREST.audio.speech.create({
      model: payload.model,
      voice: payload.voice,
      input: payload.input,
      response_format: payload?.response_format ?? "wav",
    })

    const buffer = Buffer.from(await audio.arrayBuffer())
    await fs.promises.writeFile(filePath, buffer)

    return filePath
  } catch (error: unknown) {
    logger.error("textToSpeechService | error in ttsTextToSpeech: ", error)
    throw error
  }
}
