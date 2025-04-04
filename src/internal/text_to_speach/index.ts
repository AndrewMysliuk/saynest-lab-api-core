import { IListenAndTypeItem, ISimulationDialogue, ITTSPayload } from "../../types"

export interface ITextToSpeach {
  ttsTextToSpeechStream(payload: ITTSPayload, session_folder?: string, output?: { filePath?: string }): AsyncGenerator<Buffer, void>
  ttsTextToSpeechListeningTask(payload: ITTSPayload, items: IListenAndTypeItem[]): Promise<IListenAndTypeItem[]>
  ttsTextToSpeechDialog(dialog: ISimulationDialogue): Promise<ISimulationDialogue>
}
