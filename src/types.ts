export type MessageRole = "user" | "model";

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
  isVoice?: boolean;
  audioUrl?: string;
  attachment?: {
    data: string;
    mimeType: string;
    name: string;
  };
}

export type ModelType = "fast" | "pro";

export interface AppSettings {
  model: ModelType;
  voice: string;
  accentColor: string;
  isLiveMode: boolean;
}
