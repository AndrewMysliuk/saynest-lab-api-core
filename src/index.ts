import express from "express"
import cors from "cors"
import { createServer } from "http"
import { serverConfig } from "./config"
import logger from "./utils/logger"
import routers from "./routes"

const app = express()
const server = createServer(app)

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
)

app.use(express.json())

app.use("/api", routers)

server.listen(serverConfig.PORT, () => {
  logger.info(`Server started on port ${serverConfig.PORT}`)
})
