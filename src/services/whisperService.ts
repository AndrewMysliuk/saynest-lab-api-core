import { openaiREST } from "../config"
import logger from "../utils/logger"
import * as fs from "fs"
import { promises as fsPromises } from "fs"
import * as path from "path"

export const whisperSpeechToText = async (audioFile: Express.Multer.File, prompt?: string): Promise<string> => {
  const userSessionsDir = path.join(process.cwd(), "user_sessions")
  const fileExtension = audioFile.originalname.split(".").pop()
  const filePath = path.join(userSessionsDir, `${Date.now()}-user-request.${fileExtension}`)

  try {
    if (!fs.existsSync(userSessionsDir)) {
      await fsPromises.mkdir(userSessionsDir, { recursive: true })
    }

    await fsPromises.writeFile(filePath, audioFile.buffer)

    const response = await openaiREST.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-1",
      prompt,
    })

    return response.text
  } catch (error: unknown) {
    logger.error("whisperService | error in whisperSpeechToText: ", error)
    throw error
  }
}
