import { Request, Response } from "express"
import logger from "../utils/logger"
import { ttsTextToSpeech } from "../services/textToSpeachService"
import { ITTSPayload } from "../types"

export const ttsTextToSpeachHandler = async (req: Request, res: Response) => {
  try {
    const { model, voice, input } = req.body as ITTSPayload

    if (!model || !voice || !input) {
      res.status(400).json({ error: "textToSpeachController | Missing required fields in payload" })
      return
    }

    res.writeHead(200, {
      "Content-Type": "audio/wav",
      "Transfer-Encoding": "chunked",
    })

    await ttsTextToSpeech(req.body, (data) => {
      res.write(data)
    })

    res.end()
  } catch (error: unknown) {
    logger.error("textToSpeachController | error in ttsTextToSpeachHandler:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}
