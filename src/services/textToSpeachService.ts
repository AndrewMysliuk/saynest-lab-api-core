import { openaiREST } from "../config"
import fs from "fs"
import logger from "../utils/logger"
import { ITTSPayload } from "../types"
import * as path from "path"

export const ttsTextToSpeech = async (payload: ITTSPayload, onData: (data: Buffer) => void, session_folder?: string) => {
  const userSessionsDir = session_folder ? session_folder : path.join(process.cwd(), "user_sessions")
  const fileExtension = payload?.response_format || "wav"
  const filePath = path.join(userSessionsDir, `${Date.now()}-model-response.${fileExtension}`)

  try {
    if (!fs.existsSync(userSessionsDir)) {
      await fs.promises.mkdir(userSessionsDir, { recursive: true })
    }

    const response = await openaiREST.audio.speech.create({
      model: payload.model,
      voice: payload.voice,
      input: payload.input ?? "",
      response_format: payload?.response_format ?? "wav",
    })

    const readableStream = response.body as unknown as NodeJS.ReadableStream

    let bufferStore = Buffer.from([])
    let streamEnded = false

    readableStream.on("data", (chunk: Buffer) => {
      if (streamEnded) return
      bufferStore = Buffer.concat([bufferStore, chunk])
      onData(chunk)
    })

    readableStream.on("end", async () => {
      streamEnded = true
      await fs.promises.writeFile(filePath, bufferStore)
    })

    readableStream.on("error", (error) => {
      streamEnded = true
      logger.error("textToSpeechService | Stream error in ttsTextToSpeech:", error)
      throw error
    })

    await new Promise((resolve, reject) => {
      readableStream.on("end", resolve)
      readableStream.on("error", reject)
    })

    return filePath
  } catch (error: unknown) {
    logger.error("textToSpeechService | error in ttsTextToSpeech: ", error)
    throw error
  }
}
