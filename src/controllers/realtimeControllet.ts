import { RealtimeClient } from "@openai/realtime-api-beta"
import WebSocket from "ws"
import logger from "../utils/logger"

export class RealtimeController {
  private apiKey: string
  private client: RealtimeClient | null = null
  private messageQueue: string[] = []

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async handleConnection(ws: WebSocket) {
    this.client = new RealtimeClient({ apiKey: this.apiKey })

    this.client.realtime.on("server.*", (event: any) => {
      logger.info(`Relaying event: ${event.type}`)
      ws.send(JSON.stringify(event))
    })

    this.client.realtime.on("close", () => {
      ws.close()
      logger.info("Realtime connection closed")
    })

    ws.on("message", (data) => {
      const event = JSON.parse(data.toString())
      logger.info(`Client sent event: ${event.type}`)

      if (this.client && this.client.isConnected()) {
        this.client.realtime.send(event.type, event)
      } else {
        this.messageQueue.push(data.toString())
      }
    })

    ws.on("close", () => {
      if (this.client) {
        this.client.disconnect()
        this.client = null
      }
    })

    try {
      await this.client.connect()
      while (this.messageQueue.length) {
        const message = this.messageQueue.shift()
        if (message) this.client.realtime.send(JSON.parse(message).type, JSON.parse(message))
      }
      logger.info("Connected to OpenAI successfully!")
    } catch (error: any) {
      logger.error(`Error connecting to OpenAI: ${error.message}`)
      ws.close()
    }
  }
}
