export type TTSVoiceType =
  | "alloy"
  | "echo"
  | "fable"
  | "onyx"
  | "nova"
  | "shimmer";

export type TTSModelType = "tts-1" | "tts-1-hd";

export type TTSModelFormatsType =
  | "mp3"
  | "opus"
  | "aac"
  | "flac"
  | "wav"
  | "pcm";

export interface ITTSPayload {
  model: TTSModelType;
  voice: TTSVoiceType;
  input?: string;
  response_format?: TTSModelFormatsType;
  speed?: number;
  stream?: boolean;
}
