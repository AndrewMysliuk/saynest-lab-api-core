import textToSpeech from "@google-cloud/text-to-speech"
import path from "path"

const isRunningInGCP = process.env.K_SERVICE !== undefined

export const googleTTSClient = isRunningInGCP
  ? new textToSpeech.TextToSpeechClient()
  : new textToSpeech.TextToSpeechClient({
      keyFilename: path.resolve(__dirname, "../../speak-mate-mvp-5b47f3ebedd5.json"),
    })
