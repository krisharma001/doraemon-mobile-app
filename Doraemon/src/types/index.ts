// Core data models and type definitions for Doraemon AI Assistant

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: number;
  status?: 'sending' | 'sent' | 'error';
  metadata?: {
    audioUrl?: string;
    confidence?: number;
    processingTime?: number;
  };
}

export interface AppState {
  // Interaction State
  currentState: 'idle' | 'listening' | 'processing' | 'responding';
  isConnected: boolean;
  hasPermissions: boolean;
  
  // Audio State
  audioLevels: number[];
  isRecording: boolean;
  currentTranscript: string;
  isTranscriptPartial: boolean;
  
  // Settings
  settings: {
    ttsEnabled: boolean;
    asrBackend: 'default' | 'whisper' | 'google';
    theme: 'dark' | 'light';
    privacyMode: boolean;
  };
  
  // Error Handling
  lastError?: {
    type: 'permission' | 'network' | 'audio' | 'backend';
    message: string;
    timestamp: number;
  };
}

// WebSocket Message Protocols
export interface AudioChunkMessage {
  type: 'audio_chunk';
  data: ArrayBuffer;
  sampleRate: number;
  timestamp: number;
}

export interface TranscriptMessage {
  type: 'transcript_final';
  text: string;
  timestamp: number;
}

export interface PartialTranscriptMessage {
  type: 'transcript_partial';
  text: string;
  confidence: number;
}

export interface AssistantResponseMessage {
  type: 'assistant_response';
  token: string;
  isComplete: boolean;
}

export type WebSocketMessage = 
  | AudioChunkMessage 
  | TranscriptMessage 
  | PartialTranscriptMessage 
  | AssistantResponseMessage;