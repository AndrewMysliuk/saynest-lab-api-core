import { Request, Response } from "express"
import logger from "../utils/logger"
import { gptConversation } from "../services/gptService"
import { IGPTPayload } from "../types"

export const gptConversationHandler = async (req: Request, res: Response) => {
  try {
    const { model, messages } = req.body as IGPTPayload

    if (!model || !messages) {
      res.status(400).json({ error: "gptController | Missing required fields in payload" })
      return
    }

    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    })

    await gptConversation(req.body, (data) => {
      res.write(data)
    })

    res.end()
  } catch (error: unknown) {
    logger.error("gptController | error in gptConversationHandler:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}
