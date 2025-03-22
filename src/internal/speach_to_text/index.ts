import { IWhisperHandlerResponse } from "../../types";

export interface ISpeachToText {
  whisperSpeechToText(
    audioFile: Express.Multer.File,
    prompt?: string,
    session_folder?: string,
  ): Promise<IWhisperHandlerResponse>;
}
