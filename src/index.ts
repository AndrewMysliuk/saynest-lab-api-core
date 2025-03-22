import express from "express";

import cors from "cors";
import fs from "fs";
import { createServer } from "https";
import path from "path";

import { connectToDatabase, serverConfig } from "./config";
import routers from "./routes";
import logger from "./utils/logger";

const httpsOptions = {
  // key: fs.readFileSync("/certs/server.key"),
  // cert: fs.readFileSync("/certs/server.crt"),
  key: fs.readFileSync("/Users/andrewmysliuk/server.key"),
  cert: fs.readFileSync("/Users/andrewmysliuk/server.crt"),
};

const app = express();
const server = createServer(httpsOptions, app);

const allowedOrigins = [
  "http://localhost:3000",
  "http://209.38.199.61:3000",
  "https://localhost:3000",
  "https://209.38.199.61:3000",
];
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());

app.use(
  "/user_sessions",
  express.static(path.join(__dirname, "../user_sessions")),
);

app.use("/api", routers);

// WS
// wsServerConfig(server)

async function startServer() {
  // DB
  await connectToDatabase();

  // Server
  server.listen(serverConfig.PORT, () => {
    logger.info(`Server started on port ${serverConfig.PORT}`);
  });
}

startServer();
