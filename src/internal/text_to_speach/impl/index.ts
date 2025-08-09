import { protos } from "@google-cloud/text-to-speech"
import axios from "axios"
import type { ReadableStream as WebReadableStream } from "node:stream/web"
import { Readable } from "stream"

import { gcsConversationBucket, gcsVocabularyBucket, googleTTSClient, openaiREST, serverConfig } from "../../../config"
import { ITTSElevenLabsPayload, ITTSGooglePayload, ITTSPayload } from "../../../types"
import { createScopedLogger, generateFileName, getStorageFilePath, normalizeAudioStream, sanitizeWordForFilename } from "../../../utils"
import { ITextToSpeach } from "../index"
import { defaultFemaleVoiceGoogle } from "./helpers"

const log = createScopedLogger("textToSpeechService")

export class TextToSpeachService implements ITextToSpeach {
  async *ttsTextToSpeechStream(payload: ITTSPayload, session_folder?: string, output?: { filePath?: string }, saveToFile: boolean = false): AsyncGenerator<Buffer, void> {
    const method = "ttsTextToSpeechStream"
    try {
      const userSessionsDir = session_folder ?? getStorageFilePath({})
      const fileExtension = payload?.response_format || "mp3"
      const fileName = generateFileName("model-response", fileExtension)
      const storagePath = `${userSessionsDir}/${fileName}`
      const gcsFile = gcsConversationBucket.file(storagePath)

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

      const webStream = response.body as WebReadableStream<Uint8Array>
      if (!webStream) throw new Error("Empty response body from OpenAI (null stream)")

      const nodeStream = Readable.fromWeb(webStream)

      const chunks: Buffer[] = []
      for await (const chunk of nodeStream) {
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array)
        chunks.push(buf)
        yield buf
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

  async *ttsTextToSpeechStreamElevenLabs(payload: ITTSElevenLabsPayload, session_folder?: string, output?: { filePath?: string }, saveToFile: boolean = false): AsyncGenerator<Buffer, void> {
    const method = "ttsTextToSpeechStreamElevenLabs"
    try {
      const userSessionsDir = session_folder ?? getStorageFilePath({})
      const fileExtension = "mp3"
      const fileName = generateFileName("model-response", fileExtension)
      const storagePath = `${userSessionsDir}/${fileName}`
      const gcsFile = gcsConversationBucket.file(storagePath)

      const voice_id = payload.voice || "EXAVITQu4vr4xnSDxMaL"
      const model_id = payload.model || "eleven_multilingual_v2"
      const stability = payload.voice_settings?.stability ?? 0.3
      const similarity_boost = payload.voice_settings?.similarity_boost ?? 0.6

      log.info(method, "Starting ElevenLabs TTS", {
        voice_id,
        model_id,
        inputLength: payload.input?.length,
        stability,
        similarity_boost,
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

      if (saveToFile) {
        await gcsFile.save(Buffer.concat(chunks), {
          metadata: {
            contentType: "audio/mp3",
          },
        })

        if (output) output.filePath = storagePath
        log.info(method, "ElevenLabs audio saved to GCS", { storagePath })
      }
    } catch (error) {
      log.error(method, "Error during ElevenLabs TTS", { error })
      throw error
    }
  }

  async *ttsTextToSpeechStreamGoogle(payload: ITTSGooglePayload, session_folder?: string, output?: { filePath?: string }, saveToFile: boolean = false): AsyncGenerator<Buffer, void> {
    const method = "ttsTextToSpeechStreamGoogle"

    try {
      const userSessionsDir = session_folder ?? getStorageFilePath({})
      const fileExtension = payload?.response_format || "mp3"
      const fileName = generateFileName("model-response", fileExtension)
      const storagePath = `${userSessionsDir}/${fileName}`
      const gcsFile = gcsConversationBucket.file(storagePath)

      log.info(method, "Starting Google TTS generation", {
        inputLength: payload.input?.length,
        voice: defaultFemaleVoiceGoogle[payload.language_code],
        response_format: fileExtension,
      })

      const request = {
        input: { text: payload.input },
        voice: {
          languageCode: payload.language_code,
          name: defaultFemaleVoiceGoogle[payload.language_code],
        },
        audioConfig: {
          audioEncoding: fileExtension.toLowerCase() === "mp3" ? protos.google.cloud.texttospeech.v1.AudioEncoding.MP3 : protos.google.cloud.texttospeech.v1.AudioEncoding.LINEAR16,
          // speakingRate: 1.25,
          speakingRate: 1.1,
          pitch: 0.0,
          volumeGainDb: 0.0,
        },
      }

      const [response] = await googleTTSClient.synthesizeSpeech(request)
      const audioBuffer: Buffer = response.audioContent as Buffer

      yield audioBuffer

      if (saveToFile) {
        await gcsFile.save(audioBuffer, {
          metadata: {
            contentType: `audio/${fileExtension}`,
          },
        })
        if (output) output.filePath = storagePath
        log.info(method, "Google TTS audio saved to GCS", { storagePath })
      }
    } catch (error) {
      log.error(method, "Error during Google TTS generation", { error })
      throw error
    }
  }

  async textToSpeechForDictionaryWords(payload: ITTSGooglePayload, word: string): Promise<string> {
    const method = "textToSpeechForDictionaryWords"
    try {
      const fileExtension = payload?.response_format || "mp3"
      const voiceName = defaultFemaleVoiceGoogle[payload.language_code]
      const sanitizedWord = sanitizeWordForFilename(word)
      const lang = payload.language_code

      const request = {
        input: { text: word },
        voice: {
          languageCode: lang,
          name: voiceName,
        },
        audioConfig: {
          audioEncoding: fileExtension.toLowerCase() === "mp3" ? protos.google.cloud.texttospeech.v1.AudioEncoding.MP3 : protos.google.cloud.texttospeech.v1.AudioEncoding.LINEAR16,
          speakingRate: 1,
          pitch: 0.0,
          volumeGainDb: 0.0,
        },
      }

      const [response] = await googleTTSClient.synthesizeSpeech(request)
      const audioBuffer: Buffer = response.audioContent as Buffer

      const gcsPath = `vocabularies-audio/${lang}/${sanitizedWord}.${fileExtension.toLowerCase()}`
      const file = gcsVocabularyBucket.file(gcsPath)

      await file.save(audioBuffer, {
        contentType: `audio/${fileExtension.toLowerCase() === "mp3" ? "mpeg" : "wav"}`,
        resumable: false,
      })

      return gcsPath
    } catch (error) {
      log.error(method, "Error during TTS generation or upload", { error })
      throw error
    }
  }
}
