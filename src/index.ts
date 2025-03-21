import express from "express"
import path from "path"
import cors from "cors"
import { createServer } from "https"
import fs from "fs"
import { serverConfig, connectToDatabase } from "./config"
import logger from "./utils/logger"
import routers from "./routes"

const httpsOptions = {
  // key: fs.readFileSync("/certs/server.key"),
  // cert: fs.readFileSync("/certs/server.crt"),
  key: fs.readFileSync("/Users/andrewmysliuk/server.key"),
  cert: fs.readFileSync("/Users/andrewmysliuk/server.crt"),
}

const app = express()
const server = createServer(httpsOptions, app)

const allowedOrigins = ["http://localhost:3000", "http://209.38.199.61:3000", "https://localhost:3000", "https://209.38.199.61:3000"]
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
)

app.use(express.json())

app.use("/user_sessions", express.static(path.join(__dirname, "../user_sessions")))

app.use("/api", routers)

// WS
// wsServerConfig(server)

async function startServer() {
  // DB
  await connectToDatabase()

  // Server
  server.listen(serverConfig.PORT, () => {
    logger.info(`Server started on port ${serverConfig.PORT}`)
  })
}

startServer()
