import { IGPTPayload } from "./IGPT";
import { ITTSPayload } from "./ITTS";

export interface IConversationHistory {
  sessionId: string;
  pairId: string;
  role: "system" | "user" | "assistant";
  content: string;
  audioUrl?: string;
  createdAt: Date;
}

export interface IConversationWhisper {
  audioFile: Express.Multer.File;
  prompt?: string;
}

export interface IConversationPayload {
  whisper: IConversationWhisper;
  gpt_model: IGPTPayload;
  tts: ITTSPayload;
  system: {
    sessionId?: string;
    globalPrompt: string;
  };
}

export interface IConversationResponse {
  session_id: string;
  conversation_history: IConversationHistory[];
}
