import { Request, Response } from "express"
import { whisperSpeechToText } from "../services/whisperService"
import logger from "../utils/logger"
import { IWhisperHandlerResponse } from "../types"

export const whisperSpeechToTextHandler = async (req: Request, res: Response) => {
  try {
    const audioFile = req.file
    const prompt = req.body.prompt as string

    if (!audioFile) {
      res.status(400).json({ error: "whisperController | audio file is required" })
    } else {
      const { transcription, user_audio_path } = await whisperSpeechToText(audioFile, prompt)

      const response: IWhisperHandlerResponse = { transcription, user_audio_path }

      res.status(200).json(response)
    }
  } catch (error: unknown) {
    logger.error("whisperController | error in whisperSpeechToTextHandler:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}
