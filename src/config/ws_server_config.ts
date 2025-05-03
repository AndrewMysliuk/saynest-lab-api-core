import { Server as HttpServer } from "http"
import WebSocket from "ws"

import { createScopedLogger } from "../utils/logger"

export const wsServerConfig = (server: HttpServer) => {
  const log = createScopedLogger("websocket")

  const wss = new WebSocket.Server({ server })

  wss.on("connection", (ws) => {
    log.info("onConnection", "WebSocket client connected")

    ws.on("close", () => {
      log.info("onClose", "WebSocket client disconnected")
    })

    ws.on("error", (error) => {
      log.error("onError", "WebSocket client error", { error })
    })
  })

  log.info("wsServerConfig", "WebSocket server is now running")
}
