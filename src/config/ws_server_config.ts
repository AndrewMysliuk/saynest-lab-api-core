import { Server as HttpServer } from "http";
import WebSocket from "ws";

// import { RealtimeController } from "../internal/realtime_api_(deprecated)/handlers/realtime_controllet"
import logger from "../utils/logger";

// import { serverConfig } from "./server_config"

export const wsServerConfig = (server: HttpServer) => {
  const wss = new WebSocket.Server({ server });
  // const realtimeController = new RealtimeController(serverConfig.OPENAI_API_KEY)

  wss.on("connection", (ws) => {
    logger.info("WS | Client connected");

    // realtimeController.handleConnection(ws)

    ws.on("close", () => {
      logger.info("WS | Client disconnected");
    });

    ws.on("error", (err) => {
      logger.error(`WS | Error in client connection: ${err}`);
    });
  });

  logger.info(`WS | Server is now running`);
};
