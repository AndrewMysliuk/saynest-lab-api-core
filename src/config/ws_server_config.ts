import { Server as HttpServer } from "http"
import WebSocket from "ws"

import { logger } from "../utils"

export const wsServerConfig = (server: HttpServer) => {
  const wss = new WebSocket.Server({ server })

  wss.on("connection", (ws) => {
    logger.info("WS | Client connected")

    ws.on("close", () => {
      logger.info("WS | Client disconnected")
    })

    ws.on("error", (err) => {
      logger.error(`WS | Error in client connection: ${JSON.stringify(err)}`)
    })
  })

  logger.info(`WS | Server is now running`)
}
