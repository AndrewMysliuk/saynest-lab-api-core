import { ITTSElevenLabsPayload, ITTSPayload } from "../../types"

export interface ITextToSpeach {
  ttsTextToSpeechStream(payload: ITTSPayload, session_folder?: string, output?: { filePath?: string }, saveToFile?: boolean): AsyncGenerator<Buffer, void>
  ttsTextToSpeechStreamElevenLabs(payload: ITTSElevenLabsPayload, session_folder?: string, output?: { filePath?: string }): AsyncGenerator<Buffer, void>
  ttsTextToSpeechBase64(payload: ITTSPayload, word: string): Promise<string>
}
