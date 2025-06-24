import { IWhisperHandlerResponse } from "../../types"

export interface ISpeachToText {
  whisperSpeechToText(audioFile: Express.Multer.File, prompt?: string, language?: string, session_folder?: string): Promise<IWhisperHandlerResponse>
  CloudSpeechToText(audioFile: Express.Multer.File, language?: string, session_folder?: string): Promise<IWhisperHandlerResponse>
}
