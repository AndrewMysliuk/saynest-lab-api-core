import { Request, Response } from "express"
import logger from "../utils/logger"
import { ttsTextToSpeech } from "../services/textToSpeachService"
import { ITTSPayload } from "../types"

export const ttsTextToSpeachHandler = async (req: Request, res: Response) => {
  try {
    const { model, voice, input } = req.body as ITTSPayload

    if (!model || !voice || !input) {
      res.status(400).json({ error: "textToSpeachController | Missing required fields in payload" })
    } else {
      const filePath = await ttsTextToSpeech(req.body)

      res.sendFile(filePath, (err) => {
        if (err) {
          return res.status(500).json({ error: "Failed to send file" })
        }
      })
    }
  } catch (error: unknown) {
    logger.error("textToSpeachController | error in ttsTextToSpeachHandler:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}
