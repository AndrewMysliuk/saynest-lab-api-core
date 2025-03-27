import { Request, RequestHandler, Response } from "express"

import logger from "../../../utils/logger"
import { IConversationService } from "../index"
import { conversationSchema } from "./validation"

export const createConversationHandler = (conversationService: IConversationService): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { organization_id, user_id }: { organization_id: string; user_id: string } = req.body

      if (!organization_id || !user_id) {
        res.status(400).json({ error: "Missing required fields" })
        return
      }

      const parsedBody = conversationSchema.parse({
        whisper: {
          ...JSON.parse(req.body.whisper),
          audio_file: req.file,
        },
        gpt_model: JSON.parse(req.body.gpt_model),
        tts: JSON.parse(req.body.tts),
        system: JSON.parse(req.body.system),
      })

      if (!parsedBody.whisper.audio_file) {
        res.status(400).json({ error: "Missing audio file" })
        return
      }

      let streamEnded = false

      res.on("close", () => {
        streamEnded = true
      })

      const { whisper, gpt_model, tts, system } = parsedBody

      const { session_id, conversation_history, last_model_response, error_analyser_response } = await conversationService.processConversation(
        { organization_id, user_id, whisper, gpt_model, tts, system },
        (role, content, audio_url, audio_chunk) => {
          if (streamEnded) return

          const data: {
            role: string
            content?: string
            audio_url?: string
            audio_chunk?: string
          } = { role }
          if (content) data.content = content
          if (audio_url) data.audio_url = audio_url
          if (audio_chunk) data.audio_chunk = audio_chunk.toString("base64")

          try {
            res.write(`${JSON.stringify(data)}\n`)
          } catch (error) {
            logger.error("createConversationHandler | Error writing to stream:", error)
          }
        },
      )

      if (!streamEnded) {
        res.write(
          JSON.stringify({
            session_id,
            conversation_history,
            last_model_response,
            error_analyser_response,
          }),
        )
        res.end()
      }
    } catch (error: unknown) {
      logger.error("createConversationHandler | error:", error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}
