import axios from "axios"
import { Readable } from "stream"

import { gcsBucket, openaiREST, serverConfig } from "../../../config"
import { ITTSElevenLabsPayload, ITTSPayload } from "../../../types"
import { generateFileName, getStorageFilePath, logger, normalizeAudioStream } from "../../../utils"
import { ITextToSpeach } from "../index"

export class TextToSpeachService implements ITextToSpeach {
  async *ttsTextToSpeechStream(payload: ITTSPayload, session_folder?: string, output?: { filePath?: string }, saveToFile: boolean = false): AsyncGenerator<Buffer, void> {
    try {
      const userSessionsDir = session_folder ?? getStorageFilePath({})
      const fileExtension = payload?.response_format || "mp3"
      const fileName = generateFileName("model-response", fileExtension)
      const storagePath = `${userSessionsDir}/${fileName}`
      const gcsFile = gcsBucket.file(storagePath)

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

      if (saveToFile) {
        await gcsFile.save(Buffer.concat(chunks), {
          metadata: {
            contentType: `audio/${fileExtension}`,
          },
        })

        if (output) output.filePath = storagePath
      }

      return
    } catch (error) {
      logger.error("textToSpeechService | error in ttsTextToSpeech: ", error)
      throw error
    }
  }

  async *ttsTextToSpeechStreamElevenLabs(payload: ITTSElevenLabsPayload, session_folder?: string, output?: { filePath?: string }): AsyncGenerator<Buffer, void> {
    try {
      const userSessionsDir = session_folder ?? getStorageFilePath({})
      const fileExtension = "mp3"
      const fileName = generateFileName("model-response", fileExtension)
      const storagePath = `${userSessionsDir}/${fileName}`
      const gcsFile = gcsBucket.file(storagePath)

      const voice_id = payload.voice || "EXAVITQu4vr4xnSDxMaL"
      const model_id = payload.model || "eleven_multilingual_v2"
      const stability = payload.voice_settings?.stability ?? 0.3
      const similarity_boost = payload.voice_settings?.similarity_boost ?? 0.6

      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}/stream`,
        {
          text: payload.input ?? "",
          model_id,
          voice_settings: {
            stability,
            similarity_boost,
          },
        },
        {
          headers: {
            "xi-api-key": serverConfig.ELEVEN_API_KEY,
            "Content-Type": "application/json",
            Accept: "audio/mpeg",
          },
          responseType: "stream",
        },
      )

      const stream = response.data as Readable
      const chunks: Buffer[] = []

      for await (const chunk of normalizeAudioStream(stream)) {
        chunks.push(chunk)
        yield chunk
      }

      await gcsFile.save(Buffer.concat(chunks), {
        metadata: {
          contentType: "audio/mp3",
        },
      })

      if (output) output.filePath = storagePath
    } catch (error: unknown) {
      console.error("ttsTextToSpeechStreamElevenLabs | error:", error)
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
