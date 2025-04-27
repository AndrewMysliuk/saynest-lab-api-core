import { Request, RequestHandler, Response } from "express"

import { IConversationResponse, StreamEventEnum } from "../../../types"
import logger from "../../../utils/logger"
import { IConversationService } from "../index"
import { conversationSchema } from "./validation"

export const createConversationHandler = (conversationService: IConversationService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const user_id = req.user?.user_id || null
      const organization_id = req.user?.organization_id || null

      const parsedBody = conversationSchema.parse({
        whisper: {
          ...JSON.parse(req.body.whisper),
          audio_file: req.file,
        },
        gpt_model: JSON.parse(req.body.gpt_model),
        tts: JSON.parse(req.body.tts),
        system: JSON.parse(req.body.system),
        target_language: JSON.parse(req.body.target_language),
        explanation_language: JSON.parse(req.body.explanation_language),
      })

      if (!parsedBody.whisper.audio_file) {
        res.status(400).json({ error: "Missing audio file" })
        return
      }

      res.setHeader("Content-Type", "application/json; charset=utf-8")
      res.setHeader("Transfer-Encoding", "chunked")
      res.setHeader("Cache-Control", "no-cache")

      let streamEnded = false
      res.on("close", () => {
        streamEnded = true
      })

      const output: { finalData?: IConversationResponse } = {}

      const generator = conversationService.streamConversation(
        {
          whisper: parsedBody.whisper,
          gpt_model: parsedBody.gpt_model,
          tts: parsedBody.tts,
          system: parsedBody.system,
          target_language: parsedBody.target_language,
          explanation_language: parsedBody.explanation_language,
        },
        organization_id,
        user_id,
        output,
      )

      for await (const event of generator) {
        if (streamEnded) break

        if (event.type === StreamEventEnum.TTS_CHUNK) {
          res.write(
            `${JSON.stringify({
              ...event,
              audioChunk: event.audioChunk.toString("base64"),
            })}\n`,
          )
        } else {
          res.write(`${JSON.stringify(event)}\n`)
        }
      }

      const finalData = output.finalData

      if (!streamEnded && finalData) {
        res.write(`${JSON.stringify({ type: StreamEventEnum.COMPLETE, ...finalData })}\n`)
      }

      res.end()
    } catch (error: unknown) {
      logger.error("createConversationHandler | error:", error)

      if (!res.headersSent) {
        res.status(500).json({ error: "Internal Server Error" })
      } else {
        res.end()
      }
    }
  }
}
