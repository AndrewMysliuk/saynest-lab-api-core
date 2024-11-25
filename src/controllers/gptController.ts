import { Request, Response } from "express"
import logger from "../utils/logger"
import { gptConversation } from "../services/gptService"
import { IGPTPayload } from "../types"

export const gptConversationHandler = async (req: Request, res: Response) => {
  try {
    const { model, messages, jsonSchema } = req.body as IGPTPayload

    if (!model || !messages || !jsonSchema) {
      res.status(400).json({ error: "gptController | Missing required fields in payload" })
      return
    }

    const response = await gptConversation(req.body)

    res.status(200).json(response)
  } catch (error: unknown) {
    logger.error(`gptController | error in gptConversationHandler: ${error}`)
    res.status(500).json({ error: "Internal Server Error" })
  }
}
