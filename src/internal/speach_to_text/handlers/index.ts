import { Request, RequestHandler, Response } from "express"

import { IWhisperHandlerResponse } from "../../../types"
import { logger } from "../../../utils"
import { ISpeachToText } from "../index"

export const whisperSpeechToTextHandler = (speachToTextService: ISpeachToText): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const audioFile = req.file
      const prompt = req.body.prompt as string

      if (!audioFile) {
        res.status(400).json({ error: "whisperController | audio file is required" })
      } else {
        const { transcription, user_audio_path, user_audio_url } = await speachToTextService.whisperSpeechToText(audioFile, prompt)

        const response: IWhisperHandlerResponse = {
          transcription,
          user_audio_path,
          user_audio_url,
        }

        res.status(200).json(response)
      }
    } catch (error: unknown) {
      logger.error("whisperController | error in whisperSpeechToTextHandler:", error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}
