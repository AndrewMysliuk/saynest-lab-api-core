import fs from "fs"
import { pipeline } from "stream/promises"
import tmp from "tmp"

import { gcsBucket, getSignedUrlFromStoragePath, googleSTTClient, openaiREST } from "../../../config"
import { IWhisperHandlerResponse } from "../../../types"
import { createScopedLogger, generateFileName, getStorageFilePath } from "../../../utils"
import { ISpeachToText } from "../index"

const log = createScopedLogger("speachToTextService")

export class SpeachToTextService implements ISpeachToText {
  async whisperSpeechToText(audioFile: Express.Multer.File, prompt?: string, language?: string, session_folder?: string): Promise<IWhisperHandlerResponse> {
    const userSessionsDir = session_folder || getStorageFilePath({})
    const fileExtension = audioFile.originalname.split(".").pop() || "wav"
    const storagePath = `${userSessionsDir}/${generateFileName("user-request", fileExtension)}`

    const gcsFile = gcsBucket.file(storagePath)
    const tmpFile = tmp.fileSync({ postfix: `.${fileExtension}` })
    const localPath = tmpFile.name

    log.info("whisperSpeechToText", "Starting transcription", {
      mimetype: audioFile.mimetype,
      storagePath,
    })

    try {
      await gcsFile.save(audioFile.buffer, {
        metadata: {
          contentType: audioFile.mimetype,
        },
      })

      log.info("whisperSpeechToText", "Uploaded audio to GCS", { storagePath })

      await pipeline(gcsFile.createReadStream(), fs.createWriteStream(localPath))

      log.info("whisperSpeechToText", "Downloaded audio from GCS", { localPath })

      const response = await openaiREST.audio.transcriptions.create({
        file: fs.createReadStream(localPath),
        model: "whisper-1",
        prompt,
        language,
      })

      log.info("whisperSpeechToText", "Transcription complete", {
        transcription: response.text.slice(0, 80),
        language,
      })

      return {
        transcription: response.text,
        user_audio_path: storagePath,
        user_audio_url: await getSignedUrlFromStoragePath(storagePath),
      }
    } catch (error) {
      log.error("whisperSpeechToText", "Failed during transcription", { error })
      throw error
    } finally {
      try {
        tmpFile.removeCallback()
        log.info("whisperSpeechToText", "Temp file cleaned up", { localPath })
      } catch (cleanupErr) {
        log.warn("whisperSpeechToText", "Temp file cleanup failed", { error: cleanupErr })
      }
    }
  }

  async CloudSpeechToText(audioFile: Express.Multer.File, language?: string, session_folder?: string): Promise<IWhisperHandlerResponse> {
    const userSessionsDir = session_folder || getStorageFilePath({})
    const fileExtension = audioFile.originalname.split(".").pop() || "wav"
    const storagePath = `${userSessionsDir}/${generateFileName("user-request", fileExtension)}`

    const gcsFile = gcsBucket.file(storagePath)
    const tmpFile = tmp.fileSync({ postfix: `.${fileExtension}` })
    const localPath = tmpFile.name

    log.info("whisperSpeechToText", "Starting transcription", {
      mimetype: audioFile.mimetype,
      storagePath,
    })

    try {
      await gcsFile.save(audioFile.buffer, {
        metadata: {
          contentType: audioFile.mimetype,
        },
      })

      log.info("whisperSpeechToText", "Uploaded audio to GCS", { storagePath })

      await pipeline(gcsFile.createReadStream(), fs.createWriteStream(localPath))

      log.info("whisperSpeechToText", "Downloaded audio from GCS", { localPath })

      const file = fs.readFileSync(localPath)
      const audioBytes = file.toString("base64")

      const [response] = await googleSTTClient.recognize({
        audio: { content: audioBytes },
        config: {
          languageCode: language,
          enableAutomaticPunctuation: true,
          model: "default",
        },
      })

      const transcription =
        response.results
          ?.map((r) => r.alternatives?.[0]?.transcript)
          .filter(Boolean)
          .join(" ") || ""

      log.info("whisperSpeechToText", "Transcription complete", {
        transcription: transcription.slice(0, 80),
        language,
      })

      return {
        transcription,
        user_audio_path: storagePath,
        user_audio_url: await getSignedUrlFromStoragePath(storagePath),
      }
    } catch (error) {
      log.error("whisperSpeechToText", "Failed during transcription", { error })
      throw error
    } finally {
      try {
        tmpFile.removeCallback()
        log.info("whisperSpeechToText", "Temp file cleaned up", { localPath })
      } catch (cleanupErr) {
        log.warn("whisperSpeechToText", "Temp file cleanup failed", { error: cleanupErr })
      }
    }
  }
}
