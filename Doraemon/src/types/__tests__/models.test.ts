import { MessageModel, AudioValidator, WebSocketValidator } from '../models';
import { Message } from '../index';

describe('MessageModel', () => {
  describe('create', () => {
    it('should create a valid message with required fields', () => {
      const message = MessageModel.create('user', 'Hello Doraemon');
      
      expect(message.id).toBeDefined();
      expect(message.role).toBe('user');
      expect(message.text).toBe('Hello Doraemon');
      expect(message.createdAt).toBeDefined();
      expect(message.status).toBe('sent');
    });

    it('should create a message with metadata', () => {
      const metadata = { confidence: 0.95, processingTime: 150 };
      const message = MessageModel.create('assistant', 'Hello there!', metadata);
      
      expect(message.metadata).toEqual(metadata);
    });
  });

  describe('validate', () => {
    it('should validate a correct message', () => {
      const validMessage: Message = {
        id: 'test-id',
        role: 'user',
        text: 'Test message',
        createdAt: Date.now(),
        status: 'sent'
      };
      
      expect(MessageModel.validate(validMessage)).toBe(true);
    });

    it('should reject message with invalid role', () => {
      const invalidMessage = {
        id: 'test-id',
        role: 'invalid' as any,
        text: 'Test message',
        createdAt: Date.now()
      };
      
      expect(MessageModel.validate(invalidMessage)).toBe(false);
    });

    it('should reject message without required fields', () => {
      const incompleteMessage = {
        role: 'user' as const,
        text: 'Test message'
      };
      
      expect(MessageModel.validate(incompleteMessage)).toBe(false);
    });
  });

  describe('sanitizeText', () => {
    it('should trim whitespace and normalize spaces', () => {
      const dirtyText = '  Hello    Doraemon  ';
      const cleanText = MessageModel.sanitizeText(dirtyText);
      
      expect(cleanText).toBe('Hello Doraemon');
    });
  });

  describe('isValidRole', () => {
    it('should validate correct roles', () => {
      expect(MessageModel.isValidRole('user')).toBe(true);
      expect(MessageModel.isValidRole('assistant')).toBe(true);
      expect(MessageModel.isValidRole('invalid')).toBe(false);
    });
  });
});

describe('AudioValidator', () => {
  describe('isValidSampleRate', () => {
    it('should validate common sample rates', () => {
      expect(AudioValidator.isValidSampleRate(44100)).toBe(true);
      expect(AudioValidator.isValidSampleRate(48000)).toBe(true);
      expect(AudioValidator.isValidSampleRate(12345)).toBe(false);
    });
  });

  describe('isValidAudioLevel', () => {
    it('should validate audio levels between 0 and 1', () => {
      expect(AudioValidator.isValidAudioLevel(0.5)).toBe(true);
      expect(AudioValidator.isValidAudioLevel(0)).toBe(true);
      expect(AudioValidator.isValidAudioLevel(1)).toBe(true);
      expect(AudioValidator.isValidAudioLevel(-0.1)).toBe(false);
      expect(AudioValidator.isValidAudioLevel(1.1)).toBe(false);
    });
  });

  describe('normalizeAudioLevels', () => {
    it('should clamp audio levels to valid range', () => {
      const levels = [-0.5, 0.3, 1.2, 0.8];
      const normalized = AudioValidator.normalizeAudioLevels(levels);
      
      expect(normalized).toEqual([0, 0.3, 1, 0.8]);
    });
  });
});

describe('WebSocketValidator', () => {
  describe('isValidAudioChunk', () => {
    it('should validate correct audio chunk message', () => {
      const validChunk = {
        type: 'audio_chunk',
        data: new ArrayBuffer(1024),
        sampleRate: 44100,
        timestamp: Date.now()
      };
      
      expect(WebSocketValidator.isValidAudioChunk(validChunk)).toBe(true);
    });

    it('should reject invalid audio chunk', () => {
      const invalidChunk = {
        type: 'audio_chunk',
        data: 'not-array-buffer',
        sampleRate: 44100,
        timestamp: Date.now()
      };
      
      expect(WebSocketValidator.isValidAudioChunk(invalidChunk)).toBe(false);
    });
  });

  describe('isValidTranscriptMessage', () => {
    it('should validate correct transcript message', () => {
      const validTranscript = {
        type: 'transcript_final',
        text: 'Hello Doraemon',
        timestamp: Date.now()
      };
      
      expect(WebSocketValidator.isValidTranscriptMessage(validTranscript)).toBe(true);
    });
  });

  describe('isValidAssistantResponse', () => {
    it('should validate correct assistant response', () => {
      const validResponse = {
        type: 'assistant_response',
        token: 'Hello',
        isComplete: false
      };
      
      expect(WebSocketValidator.isValidAssistantResponse(validResponse)).toBe(true);
    });
  });
});