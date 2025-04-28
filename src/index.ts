import express from "express"

import cookieParser from "cookie-parser"
import cors from "cors"
import fs from "fs"
import { createServer } from "https"
import path from "path"

import { connectToDatabase, disconnectFromDatabase, serverConfig, startCleanupWorker, stopCleanupWorker } from "./config"
import routers from "./routes"
import logger from "./utils/logger"

const httpsOptions = {
  // key: fs.readFileSync("/certs/server.key"),
  // cert: fs.readFileSync("/certs/server.crt"),
  key: fs.readFileSync("/Users/andrewmysliuk/server.key"),
  cert: fs.readFileSync("/Users/andrewmysliuk/server.crt"),
}

let serverInstance: any

const app = express()
const server = createServer(httpsOptions, app)

const allowedOrigins = ["http://localhost:3000", "https://localhost:3000"]
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
)

app.use(express.json())
app.use(cookieParser())

app.use("/user_sessions", express.static(path.join(__dirname, "../user_sessions")))

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
