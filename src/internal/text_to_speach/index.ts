import { IListenAndTypeItem, ISimulationDialogue, ITTSPayload } from "../../types"

export interface ITextToSpeach {
  ttsTextToSpeech(payload: ITTSPayload, onData: (data: Buffer) => void, session_folder?: string): Promise<string>
  ttsTextToSpeechListeningTask(payload: ITTSPayload, items: IListenAndTypeItem[]): Promise<IListenAndTypeItem[]>
  ttsTextToSpeechDialog(dialog: ISimulationDialogue): Promise<ISimulationDialogue>
}
