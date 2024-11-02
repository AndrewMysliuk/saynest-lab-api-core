import { Request, Response } from "express"
import { processConversation } from "../services/conversationService"
import logger from "../utils/logger"

export const conversationHandler = async (req: Request, res: Response) => {
  try {
    const whisper = JSON.parse(req.body.whisper)
    const gpt_model = JSON.parse(req.body.gpt_model)
    const tts = JSON.parse(req.body.tts)
    const system = JSON.parse(req.body.system)
    const audioFile = req.file

    if (!audioFile) {
      res.status(400).json({ error: "conversationController | missing audio file in request" })
      return
    }

    whisper.audioFile = audioFile
    let streamEnded = false

    res.on("close", () => {
      streamEnded = true
    })

    const { session_id, conversation_history } = await processConversation(
      { whisper, gpt_model, tts, system },
      (role, content, audioUrl, audioChunk) => {
        if (streamEnded) return

        const data: { role: string; content?: string; audioUrl?: string; audioChunk?: string } = { role }
        if (content) data.content = content
        if (audioUrl) data.audioUrl = audioUrl
        if (audioChunk) data.audioChunk = audioChunk.toString("base64")

        try {
          res.write(`${JSON.stringify(data)}\n`)
        } catch (error) {
          logger.error("conversationHandler | Error writing to stream:", error)
        }
      }
    )

    if (!streamEnded) {
      res.write(
        JSON.stringify({
          session_id,
          conversation_history,
        })
      )
      res.end()
    }
  } catch (error: unknown) {
    logger.error("conversationController | error:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}
