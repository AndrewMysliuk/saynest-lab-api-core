import { Request, RequestHandler, Response } from "express"

import { ITextAnalysis } from ".."
import { IGPTConversationRequest } from "../../../types"
import { createScopedLogger } from "../../../utils"

const log = createScopedLogger("TextAnalysisHandler")

export const streamingTextAnalysisHandler = (textAnalysisService: ITextAnalysis): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { gpt_payload, prompt_id } = req.body as IGPTConversationRequest

      if (!gpt_payload.messages || !gpt_payload.model || !prompt_id) {
        res.status(400).json({
          error: "streamingTextAnalysisHandler | Missing required fields in payload",
        })
        return
      }

      res.writeHead(200, {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      })

      let streamEnded = false
      res.on("close", () => {
        streamEnded = true
      })

      const generator = textAnalysisService.streamGptReplyOnly(gpt_payload, prompt_id)

      for await (const chunk of generator) {
        if (streamEnded) break
        res.write(chunk)
      }

      res.end()
    } catch (error: unknown) {
      log.error("streamingTextAnalysisHandler", "error", {
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
