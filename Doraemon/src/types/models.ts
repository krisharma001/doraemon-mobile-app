import { Message } from './index';

// Message model with validation functions
export class MessageModel {
  static create(
    role: 'user' | 'assistant',
    text: string,
    metadata?: Message['metadata']
  ): Message {
    return {
      id: this.generateId(),
      role,
      text,
      createdAt: Date.now(),
      status: 'sent',
      metadata,
    };
  }

  static validate(message: Partial<Message>): boolean {
    if (!message.id || typeof message.id !== 'string') return false;
    if (!message.role || !['user', 'assistant'].includes(message.role)) return false;
    if (!message.text || typeof message.text !== 'string') return false;
    if (!message.createdAt || typeof message.createdAt !== 'number') return false;
    
    if (message.status && !['sending', 'sent', 'error'].includes(message.status)) {
      return false;
    }
    
    return true;
  }

  static sanitizeText(text: string): string {
    return text.trim().replace(/\s+/g, ' ');
  }

  static isValidRole(role: string): role is 'user' | 'assistant' {
    return ['user', 'assistant'].includes(role);
  }

  static formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private static generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Audio validation utilities
export class AudioValidator {
  static isValidSampleRate(sampleRate: number): boolean {
    const validRates = [8000, 16000, 22050, 44100, 48000];
    return validRates.includes(sampleRate);
  }

  static isValidAudioLevel(level: number): boolean {
    return typeof level === 'number' && level >= 0 && level <= 1;
  }

  static normalizeAudioLevels(levels: number[]): number[] {
    return levels.map(level => Math.max(0, Math.min(1, level)));
  }
}

// WebSocket message validation
export class WebSocketValidator {
  static isValidAudioChunk(data: any): boolean {
    return data && 
           data.type === 'audio_chunk' &&
           data.data instanceof ArrayBuffer &&
           typeof data.sampleRate === 'number' &&
           typeof data.timestamp === 'number';
  }

  static isValidTranscriptMessage(data: any): boolean {
    return data &&
           data.type === 'transcript_final' &&
           typeof data.text === 'string' &&
           typeof data.timestamp === 'number';
  }

  static isValidPartialTranscript(data: any): boolean {
    return data &&
           data.type === 'transcript_partial' &&
           typeof data.text === 'string' &&
           typeof data.confidence === 'number';
  }

  static isValidAssistantResponse(data: any): boolean {
    return data &&
           data.type === 'assistant_response' &&
           typeof data.token === 'string' &&
           typeof data.isComplete === 'boolean';
  }
}