import * as fs from "fs"
import { promises as fsPromises } from "fs"
import * as path from "path"

import { openaiREST } from "../../../config"
import { IWhisperHandlerResponse } from "../../../types"
import { ensureStorageDirExists, generateFileName } from "../../../utils"
import logger from "../../../utils/logger"
import { ISpeachToText } from "../index"

export class SpeachToTextService implements ISpeachToText {
  async whisperSpeechToText(audioFile: Express.Multer.File, prompt?: string, language?: string, session_folder?: string): Promise<IWhisperHandlerResponse> {
    try {
      const userSessionsDir = session_folder ? session_folder : await ensureStorageDirExists({})
      const fileExtension = audioFile.originalname.split(".").pop() || "wav"
      const filePath = path.join(userSessionsDir, generateFileName("user-request", fileExtension))

      await fsPromises.writeFile(filePath, audioFile.buffer)

      const response = await openaiREST.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: "whisper-1",
        prompt,
        language,
      })

      return {
        transcription: response.text,
        user_audio_path: filePath,
      }
    } catch (error: unknown) {
      logger.error("whisperService | error in whisperSpeechToText: ", error)
      throw error
    }
  }
}
