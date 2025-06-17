import { Request, RequestHandler, Response } from "express"

import { ITTSElevenLabsPayload, ITTSPayload } from "../../../types"
import { createScopedLogger } from "../../../utils"
import { ITextToSpeach } from "../index"

const log = createScopedLogger("TextToSpeechHandler")

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
      const ttsStream = textToSpeachService.ttsTextToSpeechStream(req.body, undefined, output, true)

      for await (const chunk of ttsStream) {
        res.write(chunk)
      }

      log.info("textToSpeachHandler", "Saved TTS audio", {
        filepath: output.filePath,
      })
      res.end()
    } catch (error: unknown) {
      log.error("textToSpeachHandler", "error", {
        error,
      })

      if (!res.headersSent) {
        res.status(500).json({ error: "Internal Server Error" })
      } else {
        res.end()
      }
    }
  }
}

export const textToSpeechElevenLabsHandler = (textToSpeachService: ITextToSpeach): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { input, voice } = req.body as ITTSElevenLabsPayload

      if (!input || !voice) {
        res.status(400).json({
          error: "Missing required fields: input, voice",
        })
        return
      }

      res.writeHead(200, {
        "Content-Type": `audio/mp3`,
        "Transfer-Encoding": "chunked",
        "Content-Disposition": `inline; filename="tts-output.mp3"`,
      })

      const output: { filePath?: string } = {}
      const ttsStream = textToSpeachService.ttsTextToSpeechStreamElevenLabs(req.body, undefined, output, true)

      for await (const chunk of ttsStream) {
        res.write(chunk)
      }

      log.info("textToSpeechElevenLabsHandler", "ElevenLabs TTS audio saved at", {
        filepath: output.filePath,
      })
      res.end()
    } catch (error: unknown) {
      log.error("textToSpeechElevenLabsHandler", "error", {
        error,
      })

      if (!res.headersSent) {
        res.status(500).json({ error: "Internal Server Error" })
      } else {
        res.end()
      }
    }
  }
}
