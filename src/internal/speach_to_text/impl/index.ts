import fs from "fs"
import { pipeline } from "stream/promises"
import tmp from "tmp"

import { gcsBucket, getSignedUrlFromStoragePath, openaiREST } from "../../../config"
import { IWhisperHandlerResponse } from "../../../types"
import { generateFileName, getStorageFilePath } from "../../../utils"
import logger from "../../../utils/logger"
import { ISpeachToText } from "../index"

export class SpeachToTextService implements ISpeachToText {
  async whisperSpeechToText(audioFile: Express.Multer.File, prompt?: string, language?: string, session_folder?: string): Promise<IWhisperHandlerResponse> {
    const userSessionsDir = session_folder ? session_folder : getStorageFilePath({})
    const fileExtension = audioFile.originalname.split(".").pop() || "wav"
    const storagePath = `${userSessionsDir}/${generateFileName("user-request", fileExtension)}`

    const gcsFile = gcsBucket.file(storagePath)

    const tmpFile = tmp.fileSync({ postfix: `.${fileExtension}` })
    const localPath = tmpFile.name

    try {
      await gcsFile.save(audioFile.buffer, {
        metadata: {
          contentType: audioFile.mimetype,
        },
      })

      await pipeline(gcsFile.createReadStream(), fs.createWriteStream(localPath))

      const response = await openaiREST.audio.transcriptions.create({
        file: fs.createReadStream(localPath),
        model: "whisper-1",
        prompt,
        language,
      })

      return {
        transcription: response.text,
        user_audio_path: storagePath,
        user_audio_url: await getSignedUrlFromStoragePath(storagePath),
      }
    } catch (error: unknown) {
      logger.error("whisperService | error in whisperSpeechToText: ", error)
      throw error
    } finally {
      try {
        tmpFile.removeCallback()
      } catch (cleanupErr) {
        logger.warn("Could not clean up temp file:", cleanupErr)
      }
    }
  }
}
