import WebSocket from "ws"
import { Server as HttpServer } from "http"
import { realtimeConnectionHandlers } from "../controllers/RealtimeController"
import logger from "../utils/logger"

export const wsServerConfig = (server: HttpServer) => {
  const wss = new WebSocket.Server({ server })

  wss.on("connection", (ws) => {
    logger.info("WS | Client connected")

    realtimeConnectionHandlers(ws)

    ws.on("close", () => {
      logger.info("WS | Client disconnected")
    })

    ws.on("error", (err) => {
      logger.error(`WS | Error in client connection: ${err}`)
    })
  })

  logger.info(`WS | Server is now running`)
}
