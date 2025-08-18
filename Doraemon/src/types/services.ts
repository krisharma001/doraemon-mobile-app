// Service layer interfaces for Doraemon AI Assistant

export interface AudioManager {
  startRecording(): Promise<void>;
  stopRecording(): Promise<ArrayBuffer>;
  getAudioLevels(): number[];
  isRecording(): boolean;
  requestPermissions(): Promise<boolean>;
}

export interface WebSocketManager {
  connect(url: string): Promise<void>;
  disconnect(): void;
  sendAudioChunk(chunk: ArrayBuffer): void;
  sendMessage(message: string): void;
  onTranscriptPartial(callback: (text: string) => void): void;
  onTranscriptFinal(callback: (text: string) => void): void;
  onAssistantResponse(callback: (token: string) => void): void;
}

export interface MessageStore {
  messages: Message[];
  addMessage(message: Omit<Message, 'id' | 'createdAt'>): void;
  updateMessage(id: string, updates: Partial<Message>): void;
  clearHistory(): void;
  getMessageById(id: string): Message | undefined;
}

export interface PermissionManager {
  requestMicrophonePermission(): Promise<boolean>;
  checkMicrophonePermission(): Promise<boolean>;
  openAppSettings(): void;
}

export interface VoiceActivityDetector {
  start(audioLevels: number[]): void;
  stop(): void;
  onSilenceDetected(callback: () => void): void;
  onVoiceDetected(callback: () => void): void;
  setSilenceThreshold(threshold: number): void;
  setSilenceTimeout(timeout: number): void;
}

export interface ErrorRecoveryStrategy {
  maxRetries: number;
  retryDelay: number;
  fallbackAction?: () => void;
  userNotification: {
    title: string;
    message: string;
    actions: Array<{
      label: string;
      action: () => void;
    }>;
  };
}

// Import Message type
import { Message } from './index';