export enum MessageSender {
  User = 'user',
  Soulingo = 'soulingo',
}

export enum MessageType {
  Text = 'text',
  ImageAnalysis = 'imageAnalysis',
  GrammarCorrection = 'grammarCorrection',
}

export interface TextContent {
  text: string;
}

export interface ImageAnalysisContent {
  imagePrompt: string;
  identifiedObjects: {
    english: string;
    turkish: string;
    sentence: string;
  }[];
}

export interface Message {
  id: string;
  sender: MessageSender;
  timestamp: Date;
  type: MessageType;
  content: TextContent | ImageAnalysisContent;
}

export interface ImageFile {
  base64: string;
  mimeType: string;
  fileName: string;
}

export interface Note {
  id: string;
  text: string;
  timestamp: string;
}

export type AppMode = 'landing' | 'chat' | 'vision' | 'notebook';
