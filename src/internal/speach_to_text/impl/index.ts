import * as fs from "fs";
import { promises as fsPromises } from "fs";
import * as path from "path";

import { openaiREST } from "../../../config";
import { IWhisperHandlerResponse } from "../../../types";
import logger from "../../../utils/logger";
import { ISpeachToText } from "../index";

export class SpeachToTextService implements ISpeachToText {
  async whisperSpeechToText(
    audioFile: Express.Multer.File,
    prompt?: string,
    session_folder?: string,
  ): Promise<IWhisperHandlerResponse> {
    const userSessionsDir = session_folder
      ? session_folder
      : path.join(process.cwd(), "user_sessions");
    const fileExtension = audioFile.originalname.split(".").pop();
    const filePath = path.join(
      userSessionsDir,
      `${Date.now()}-user-request.${fileExtension}`,
    );

    try {
      if (!fs.existsSync(userSessionsDir)) {
        await fsPromises.mkdir(userSessionsDir, { recursive: true });
      }

      await fsPromises.writeFile(filePath, audioFile.buffer);

      const response = await openaiREST.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: "whisper-1",
        prompt,
      });

      return {
        transcription: response.text,
        user_audio_path: filePath,
      };
    } catch (error: unknown) {
      logger.error("whisperService | error in whisperSpeechToText: ", error);
      throw error;
    }
  }
}
