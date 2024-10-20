import { openai } from "../config"
import logger from "../utils/logger"
import * as fs from "fs"
import { promises as fsPromises } from "fs"
import * as tmp from "tmp"

export const whisperSpeechToText = async (audioFile: Express.Multer.File, prompt?: string): Promise<string> => {
  const tempFile = tmp.fileSync({ postfix: `.${audioFile.originalname.split(".").pop()}` })

  try {
    await fsPromises.writeFile(tempFile.name, audioFile.buffer)

    const response = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFile.name),
      model: "whisper-1",
      prompt,
    })

    return response.text
  } catch (error: unknown) {
    logger.error("whisperService | error in whisperSpeechToText: ", error)
    throw error
  } finally {
    tempFile.removeCallback()
  }
}
