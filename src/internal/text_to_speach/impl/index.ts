import axios from "axios"
import { Readable } from "stream"

import { gcsBucket, openaiREST, serverConfig } from "../../../config"
import { ITTSElevenLabsPayload, ITTSPayload } from "../../../types"
import { createScopedLogger, generateFileName, getStorageFilePath, normalizeAudioStream } from "../../../utils"
import { ITextToSpeach } from "../index"

const log = createScopedLogger("textToSpeechService")

export class TextToSpeachService implements ITextToSpeach {
  async *ttsTextToSpeechStream(payload: ITTSPayload, session_folder?: string, output?: { filePath?: string }, saveToFile: boolean = false): AsyncGenerator<Buffer, void> {
    const method = "ttsTextToSpeechStream"
    try {
      const userSessionsDir = session_folder ?? getStorageFilePath({})
      const fileExtension = payload?.response_format || "mp3"
      const fileName = generateFileName("model-response", fileExtension)
      const storagePath = `${userSessionsDir}/${fileName}`
      const gcsFile = gcsBucket.file(storagePath)

      log.info(method, "Starting OpenAI TTS generation", {
        inputLength: payload.input?.length,
        model: payload.model,
        voice: payload.voice,
        response_format: fileExtension,
      })

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
        log.info(method, "Audio saved to GCS", { storagePath })
      }
    } catch (error) {
      log.error(method, "Error during OpenAI TTS generation", { error })
      throw error
    }
  }

  async *ttsTextToSpeechStreamElevenLabs(payload: ITTSElevenLabsPayload, session_folder?: string, output?: { filePath?: string }): AsyncGenerator<Buffer, void> {
    const method = "ttsTextToSpeechStreamElevenLabs"
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

      log.info(method, "Starting ElevenLabs TTS", {
        voice_id,
        model_id,
        inputLength: payload.input?.length,
      })

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
      log.info(method, "ElevenLabs audio saved to GCS", { storagePath })
    } catch (error) {
      log.error(method, "Error during ElevenLabs TTS", { error })
      throw error
    }
  }

  async ttsTextToSpeechBase64(payload: ITTSPayload, word: string): Promise<string> {
    const method = "ttsTextToSpeechBase64"
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

      log.info(method, "Generated base64 audio", {
        model: payload.model,
        voice: payload.voice,
        word,
        size: buffer.length,
      })

      return `data:audio/wav;base64,${base64}`
    } catch (error) {
      log.error(method, "Error during base64 TTS generation", { error })
      throw error
    }
  }
}
