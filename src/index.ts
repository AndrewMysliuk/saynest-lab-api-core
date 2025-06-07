import express from "express"

import cookieParser from "cookie-parser"
import cors from "cors"
import { createServer } from "http"

import { connectToDatabase, disconnectFromDatabase, serverConfig, startCleanupWorker, stopCleanupWorker } from "./config"
import { apiRouter, paddleRouter } from "./routes"
import { createScopedLogger } from "./utils"

const log = createScopedLogger("main")
let serverInstance: any

const app = express()
const server = createServer({}, app)

const allowedOrigins = ["http://localhost:3000", "https://frontend-926895610955.europe-central2.run.app"]

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
)

app.use(express.json())
app.use(cookieParser())

app.use(paddleRouter)
app.use("/api", apiRouter)

// WebSocket support — optional
// wsServerConfig(server)

async function startServer() {
  try {
    await connectToDatabase()
    startCleanupWorker()

    serverInstance = server.listen(serverConfig.PORT, () => {
      log.info("startServer", "Server started successfully", { port: serverConfig.PORT })
    })
  } catch (error) {
    log.error("startServer", "Failed to start server", { error })
    process.exit(1)
  }
}

async function gracefulShutdown(signal: string) {
  log.info("gracefulShutdown", "Shutdown signal received", { signal })

  try {
    if (serverInstance) {
      await new Promise<void>((resolve, reject) => {
        serverInstance.close((err: unknown) => {
          if (err) return reject(err)
          resolve()
        })
      })
      log.info("gracefulShutdown", "HTTP server closed")
    }

    stopCleanupWorker()
    log.info("gracefulShutdown", "Cleanup worker stopped")

    await disconnectFromDatabase()
    log.info("gracefulShutdown", "Database connection closed")

    process.exit(0)
  } catch (error) {
    log.error("gracefulShutdown", "Error during shutdown", { error })
    process.exit(1)
  }
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"))
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))

startServer()
