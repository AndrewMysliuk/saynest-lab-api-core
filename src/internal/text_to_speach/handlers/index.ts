import { Request, RequestHandler, Response } from "express"

import { ITTSPayload } from "../../../types"
import logger from "../../../utils/logger"
import { ITextToSpeach } from "../index"

export const textToSpeachHandler = (textToSpeachService: ITextToSpeach): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { model, voice, input, response_format = "wav" } = req.body as ITTSPayload

      if (!model || !voice || !input) {
        res.status(400).json({
          error: "textToSpeachController | Missing required fields in payload",
        })
        return
      }

      res.writeHead(200, {
        "Content-Type": `audio/${response_format}`,
        "Transfer-Encoding": "chunked",
        "Content-Disposition": 'inline; filename="tts-output.' + response_format + '"',
      })

      const output: { filePath?: string } = {}
      const ttsStream = textToSpeachService.ttsTextToSpeechStream(req.body, undefined, output)

      for await (const chunk of ttsStream) {
        res.write(chunk)
      }

      logger.debug("Saved TTS audio:", output.filePath)
      res.end()
    } catch (error: unknown) {
      logger.error("textToSpeachController | error in ttsTextToSpeachHandler:", error)
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal Server Error" })
      } else {
        res.end()
      }
    }
  }
}
