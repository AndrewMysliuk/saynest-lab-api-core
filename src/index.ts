import express from "express"

import cookieParser from "cookie-parser"
import cors from "cors"
import { createServer } from "http"

import { connectToDatabase, disconnectFromDatabase, serverConfig, startCleanupWorker, stopCleanupWorker } from "./config"
import routers from "./routes"
import logger from "./utils/logger"

let serverInstance: any

const app = express()
const server = createServer({}, app)

const allowedOrigins = ["http://localhost:3000"]
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
)

app.use(express.json())
app.use(cookieParser())

app.use("/api", routers)

// WS
// wsServerConfig(server)

async function startServer() {
  // DB
  await connectToDatabase()

  // Start cleanup worker
  startCleanupWorker()

  // Server
  serverInstance = server.listen(serverConfig.PORT, () => {
    logger.info(`Server started on port ${serverConfig.PORT}`)
  })
}

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  logger.info(`[SHUTDOWN] Received ${signal}. Closing server...`)

  try {
    if (serverInstance) {
      await new Promise((resolve, reject) => {
        serverInstance.close((err: any) => {
          if (err) return reject(err)
          resolve(true)
        })
      })
      logger.info("[SHUTDOWN] HTTP server closed.")
    }

    // Stop background workers
    stopCleanupWorker()
    logger.info("[SHUTDOWN] Cleanup worker stopped.")

    // Close DB connection
    await disconnectFromDatabase()
    logger.info("[SHUTDOWN] Database connection closed.")

    process.exit(0)
  } catch (error) {
    logger.error("[SHUTDOWN] Error during shutdown:", error)
    process.exit(1)
  }
}

// ловим сигналы остановки
process.on("SIGINT", () => gracefulShutdown("SIGINT"))
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))

startServer()
