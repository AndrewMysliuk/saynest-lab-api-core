import fs from "fs"
import * as path from "path"
import { buffer } from "stream/consumers"

import { openaiREST } from "../../../config"
import { IListenAndTypeItem, ITTSPayload } from "../../../types"
import logger from "../../../utils/logger"
import { ITextToSpeach } from "../index"

export class TextToSpeachService implements ITextToSpeach {
  async ttsTextToSpeech(payload: ITTSPayload, onData: (data: Buffer) => void, session_folder?: string): Promise<string> {
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
        response_format: fileExtension,
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

  async ttsTextToSpeechListeningTask(payload: ITTSPayload, items: IListenAndTypeItem[]): Promise<IListenAndTypeItem[]> {
    const userSessionsDir = path.join(process.cwd(), "user_sessions", "listening_tasks")
    const fileExtension = payload?.response_format || "wav"
    const results: IListenAndTypeItem[] = []

    try {
      if (!fs.existsSync(userSessionsDir)) {
        await fs.promises.mkdir(userSessionsDir, { recursive: true })
      }

      for (const item of items) {
        const audioFilePath = path.join(userSessionsDir, `${Date.now()}-${Math.random()}-listening-task.${fileExtension}`)

        const response = await openaiREST.audio.speech.create({
          model: payload.model,
          voice: payload.voice,
          input: item.correct_transcript,
          response_format: fileExtension,
        })

        const audioBuffer = await buffer(response.body as NodeJS.ReadableStream)

        await fs.promises.writeFile(audioFilePath, audioBuffer)

        results.push({
          audio_url: `/user_sessions/listening_tasks/${path.basename(audioFilePath)}`,
          correct_transcript: item.correct_transcript,
        })
      }

      return results
    } catch (error: unknown) {
      logger.error("textToSpeechService | error in ttsTextToSpeechListeningTask: ", error)
      throw error
    }
  }
}
