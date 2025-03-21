import { Request, RequestHandler, Response } from "express"
import logger from "../../../utils/logger"
import { ITTSPayload } from "../../../types"
import { ITextToSpeach } from "../index"

export const textToSpeachHandler = (textToSpeachService: ITextToSpeach): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
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

      await textToSpeachService.ttsTextToSpeech(req.body, (data) => {
        res.write(data)
      })

      res.end()
    } catch (error: unknown) {
      logger.error("textToSpeachController | error in ttsTextToSpeachHandler:", error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}
