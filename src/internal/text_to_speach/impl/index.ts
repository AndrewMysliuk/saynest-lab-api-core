import ffmpegPath from "ffmpeg-static"
import ffmpeg from "fluent-ffmpeg"
import fs from "fs"
import * as path from "path"
import { buffer } from "stream/consumers"
import { v4 as uuidv4 } from "uuid"

import { openaiREST } from "../../../config"
import { IListenAndTypeItem, ISimulationDialogue, ITTSPayload } from "../../../types"
import logger from "../../../utils/logger"
import { ITextToSpeach } from "../index"

ffmpeg.setFfmpegPath(ffmpegPath || "")

export class TextToSpeachService implements ITextToSpeach {
  async *ttsTextToSpeechStream(payload: ITTSPayload, session_folder?: string, output?: { filePath?: string }): AsyncGenerator<Buffer, void> {
    try {
      const userSessionsDir = session_folder ? session_folder : path.join(process.cwd(), "user_sessions")
      const fileExtension = payload?.response_format || "wav"
      const filePath = path.join(userSessionsDir, `${Date.now()}-model-response.${fileExtension}`)

      if (!fs.existsSync(userSessionsDir)) {
        await fs.promises.mkdir(userSessionsDir, { recursive: true })
      }

      const response = await openaiREST.audio.speech.create({
        model: payload.model,
        voice: payload.voice,
        input: payload.input ?? "",
        response_format: fileExtension,
      })

      const readableStream = response.body as NodeJS.ReadableStream

      const chunks: Buffer[] = []

      for await (const chunk of readableStream as AsyncIterable<Buffer>) {
        chunks.push(chunk)
        yield chunk
      }

      await fs.promises.writeFile(filePath, Buffer.concat(chunks))
      output && (output.filePath = filePath)
      return
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

  async ttsTextToSpeechDialog(dialog: ISimulationDialogue): Promise<ISimulationDialogue> {
    const userSessionsDir = path.join(process.cwd(), "user_sessions", "scenario_simulation")
    const tmpDir = path.join(userSessionsDir, uuidv4())
    const mergedFilePath = path.join(userSessionsDir, `${dialog.id}-merged.wav`)
    const fileExtension = "wav"

    try {
      if (!fs.existsSync(userSessionsDir)) {
        await fs.promises.mkdir(userSessionsDir, { recursive: true })
      }

      await fs.promises.mkdir(tmpDir, { recursive: true })

      const silencePath = path.join(tmpDir, "silence.wav")

      // Silence Generation
      await new Promise<void>((resolve, reject) => {
        ffmpeg()
          .input("anullsrc=r=24000:cl=mono")
          .inputFormat("lavfi")
          .audioCodec("pcm_s16le")
          .duration(1)
          .output(silencePath)
          .on("end", () => resolve())
          .on("error", (err) => reject(err))
          .run()
      })

      const tempFiles: string[] = []

      for (const [index, item] of dialog.original.entries()) {
        const filePath = path.join(tmpDir, `${index}-${item.role.toLowerCase()}.${fileExtension}`)

        const response = await openaiREST.audio.speech.create({
          model: "tts-1",
          voice: item.role === "AI" ? "alloy" : "echo",
          input: item.text,
          response_format: fileExtension,
        })

        const audioBuffer = await buffer(response.body as NodeJS.ReadableStream)
        await fs.promises.writeFile(filePath, audioBuffer)

        tempFiles.push(filePath)

        // Add Silence Between Tips
        if (index < dialog.original.length - 1) {
          tempFiles.push(silencePath)
        }
      }

      return new Promise((resolve, reject) => {
        const merged = ffmpeg()

        tempFiles.forEach((f) => {
          merged.input(f)
        })

        merged
          .on("error", (err: unknown) => {
            console.error("FFmpeg error:", err)
            reject(err)
          })
          .on("end", async () => {
            await fs.promises.rm(tmpDir, { recursive: true, force: true })
            dialog.audio_url = `/user_sessions/scenario_simulation/${path.basename(mergedFilePath)}`
            resolve(dialog)
          })
          .mergeToFile(mergedFilePath, tmpDir)
      })
    } catch (error) {
      console.error("ttsTextToSpeechDialog | error: ", error)
      throw error
    }
  }

  async ttsTextToSpeechBase64(payload: ITTSPayload, word: string): Promise<string> {
    try {
      const response = await openaiREST.audio.speech.create({
        model: payload.model,
        voice: payload.voice,
        input: word,
        response_format: "wav",
      })

      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const base64 = buffer.toString("base64")

      return `data:audio/wav;base64,${base64}`
    } catch (error) {
      console.error("ttsTextToSpeechWordAudio | error: ", error)
      throw error
    }
  }
}
