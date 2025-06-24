import speech from "@google-cloud/speech"
import path from "path"

const isRunningInGCP = process.env.K_SERVICE !== undefined

export const googleSTTClient = isRunningInGCP
  ? new speech.SpeechClient()
  : new speech.SpeechClient({
      keyFilename: path.resolve(__dirname, "../../speak-mate-mvp-b04596891332.json"),
    })
