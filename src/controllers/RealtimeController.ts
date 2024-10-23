import WebSocket from "ws"
import { REALTIME_BETA_MODEL_URL, openaiWSOptions } from "../config"
import logger from "../utils/logger"
import { convertMessageToString } from "../utils"
import { RealtimeAPIServerEventsEnum, RealtimeAPIClientEventsEnum } from "../types"

export const realtimeConnectionHandlers = (clientWS: WebSocket) => {
  const openaiWS = new WebSocket(REALTIME_BETA_MODEL_URL, openaiWSOptions)

  openaiWS.on("open", () => {
    logger.info("openaiWS | Connection opened")

    const initMessage = JSON.stringify({
      type: RealtimeAPIClientEventsEnum.SESSION_UPDATE,
      session: {
        modalities: ["text", "audio"],
        instructions: "You are an English language assistant who provides answers in both text and audio...",
        temperature: 0.6,
        voice: "alloy",
      },
    })

    openaiWS.send(initMessage)
  })

  clientWS.on("message", (message) => {
    const clientMessage = convertMessageToString(message)
    logger.info(`WS | Client message: ${clientMessage}`)

    if (openaiWS.readyState === WebSocket.OPEN) {
      openaiWS.send(clientMessage)
    } else {
      logger.info("WS | OpenAI WebSocket is not ready")
    }
  })

  openaiWS.on("message", (messageFromOpenAI) => {
    const parsedMessage = convertMessageToString(messageFromOpenAI)
    logger.info(`openaiWS | Received message from OpenAI: ${parsedMessage}`)

    const parsedJson = JSON.parse(parsedMessage)

    switch (parsedJson.type) {
      case RealtimeAPIServerEventsEnum.CONVERSATION_ITEM_CREATED:
        openaiWS.send(JSON.stringify({ type: RealtimeAPIClientEventsEnum.RESPONSE_CREATE }))
      case RealtimeAPIServerEventsEnum.RESPONSE_DONE:
        logger.info("openaiWS | Response generation completed")
        break
      case RealtimeAPIServerEventsEnum.ERROR:
        logger.error(`openaiWS | Error from OpenAI: ${parsedJson}`)
        // clientWS.close()
        break
      default:
        break
    }

    if (clientWS.readyState === WebSocket.OPEN) {
      clientWS.send(parsedMessage)
    }
  })
}
