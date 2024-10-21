import { Request, Response } from "express"
import fs from "fs"
import logger from "../utils/logger"
import { ttsTextToSpeach } from "../services/textToSpeachService"
import { ITTSPayload } from "../types"

export const ttsTextToSpeachHandler = async (req: Request, res: Response) => {
  try {
    const { model, voice, input } = req.body as ITTSPayload

    if (!model || !voice || !input) {
      res.status(400).json({ error: "textToSpeachController | Missing required fields in payload" })
    } else {
      const tempFilePath = await ttsTextToSpeach(req.body)

      res.sendFile(tempFilePath, (err) => {
        if (err) {
          return res.status(500).json({ error: "Failed to send file" })
        }

        fs.unlink(tempFilePath, (error: unknown) => {
          if (error) throw error
        })
      })
    }
  } catch (error: unknown) {
    logger.error("textToSpeachController | error in ttsTextToSpeachHandler:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}
