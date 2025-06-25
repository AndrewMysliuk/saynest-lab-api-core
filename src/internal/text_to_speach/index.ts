import { ITTSElevenLabsPayload, ITTSGooglePayload, ITTSPayload } from "../../types"

export interface ITextToSpeach {
  ttsTextToSpeechStream(payload: ITTSPayload, session_folder?: string, output?: { filePath?: string }, saveToFile?: boolean): AsyncGenerator<Buffer, void>
  ttsTextToSpeechStreamElevenLabs(payload: ITTSElevenLabsPayload, session_folder?: string, output?: { filePath?: string }, saveToFile?: boolean): AsyncGenerator<Buffer, void>
  ttsTextToSpeechStreamGoogle(payload: ITTSGooglePayload, session_folder?: string, output?: { filePath?: string }, saveToFile?: boolean): AsyncGenerator<Buffer, void>

  ttsTextToSpeechBase64(payload: ITTSPayload, word: string): Promise<string>
}
