import { openaiREST } from "../config"
import fs from "fs"
import logger from "../utils/logger"
import { ITTSPayload } from "../types"
import * as tmp from "tmp"

export const ttsTextToSpeach = async (payload: ITTSPayload) => {
  try {
    const audio = await openaiREST.audio.speech.create({
      model: payload.model,
      voice: payload.voice,
      input: payload.input,
    })

    const buffer = Buffer.from(await audio.arrayBuffer())
    const tempFile = tmp.fileSync({ postfix: payload?.response_format ? `.${payload.response_format}` : ".mp3" })
    await fs.promises.writeFile(tempFile.name, buffer)

    return tempFile.name
  } catch (error: unknown) {
    logger.error("textToSpeachService | error in ttsTextToSpeach: ", error)
    throw error
  }
}
