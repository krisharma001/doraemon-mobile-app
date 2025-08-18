import { AudioManager } from '../AudioManager';
import { Audio } from 'expo-av';

// Mock expo-av
jest.mock('expo-av', () => ({
  Audio: {
    requestPermissionsAsync: jest.fn(),
    setAudioModeAsync: jest.fn(),
    Recording: jest.fn().mockImplementation(() => ({
      prepareToRecordAsync: jest.fn(),
      startAsync: jest.fn(),
      stopAndUnloadAsync: jest.fn(),
      getURI: jest.fn(),
      getStatusAsync: jest.fn(),
    })),
    RecordingQuality: {
      HIGH: 'high',
    },
  },
}));

// Mock fetch for audio buffer
global.fetch = jest.fn();

const mockAudio = Audio as jest.Mocked<typeof Audio>;
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('AudioManager', () => {
  let audioManager: AudioManager;
  let mockRecording: any;

  beforeEach(() => {
    audioManager = AudioManager.getInstance();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock recording
    mockRecording = {
      prepareToRecordAsync: jest.fn(),
      startAsync: jest.fn(),
      stopAndUnloadAsync: jest.fn(),
      getURI: jest.fn(),
      getStatusAsync: jest.fn(),
    };
    
    (mockAudio.Recording as any).mockImplementation(() => mockRecording);
  });

  afterEach(() => {
    // Cleanup
    audioManager.dispose();
  });

  describe('Singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = AudioManager.getInstance();
      const instance2 = AudioManager.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('Permission handling', () => {
    it('should request permissions successfully', async () => {
      mockAudio.requestPermissionsAsync.mockResolvedValue({ status: 'granted' } as any);
      
      const result = await audioManager.requestPermissions();
      
      expect(result).toBe(true);
      expect(mockAudio.requestPermissionsAsync).toHaveBeenCalled();
    });

    it('should handle permission denial', async () => {
      mockAudio.requestPermissionsAsync.mockResolvedValue({ status: 'denied' } as any);
      
      const result = await audioManager.requestPermissions();
      
      expect(result).toBe(false);
    });

    it('should handle permission request errors', async () => {
      mockAudio.requestPermissionsAsync.mockRejectedValue(new Error('Permission error'));
      
      const result = await audioManager.requestPermissions();
      
      expect(result).toBe(false);
    });
  });

  describe('Recording lifecycle', () => {
    beforeEach(() => {
      mockAudio.setAudioModeAsync.mockResolvedValue(undefined);
      mockRecording.prepareToRecordAsync.mockResolvedValue(undefined);
      mockRecording.startAsync.mockResolvedValue(undefined);
    });

    it('should start recording successfully', async () => {
      await audioManager.startRecording();
      
      expect(mockAudio.setAudioModeAsync).toHaveBeenCalledWith({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });
      expect(mockRecording.prepareToRecordAsync).toHaveBeenCalled();
      expect(mockRecording.startAsync).toHaveBeenCalled();
      expect(audioManager.isRecording()).toBe(true);
    });

    it('should not start recording if already recording', async () => {
      await audioManager.startRecording();
      
      // Try to start again
      await audioManager.startRecording();
      
      // Should only be called once
      expect(mockRecording.startAsync).toHaveBeenCalledTimes(1);
    });

    it('should handle recording start errors', async () => {
      mockRecording.startAsync.mockRejectedValue(new Error('Start failed'));
      
      await expect(audioManager.startRecording()).rejects.toThrow('Failed to start audio recording');
      expect(audioManager.isRecording()).toBe(false);
    });

    it('should stop recording and return audio buffer', async () => {
      const mockArrayBuffer = new ArrayBuffer(1024);
      const mockUri = 'file://test.m4a';
      
      mockRecording.getURI.mockReturnValue(mockUri);
      mockRecording.stopAndUnloadAsync.mockResolvedValue(undefined);
      mockFetch.mockResolvedValue({
        arrayBuffer: () => Promise.resolve(mockArrayBuffer),
      } as any);
      
      // Start recording first
      await audioManager.startRecording();
      
      // Stop recording
      const result = await audioManager.stopRecording();
      
      expect(mockRecording.stopAndUnloadAsync).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledWith(mockUri);
      expect(result).toBe(mockArrayBuffer);
      expect(audioManager.isRecording()).toBe(false);
    });

    it('should handle stop recording errors', async () => {
      await audioManager.startRecording();
      
      mockRecording.stopAndUnloadAsync.mockRejectedValue(new Error('Stop failed'));
      
      await expect(audioManager.stopRecording()).rejects.toThrow('Failed to stop audio recording');
      expect(audioManager.isRecording()).toBe(false);
    });

    it('should throw error when stopping without recording', async () => {
      await expect(audioManager.stopRecording()).rejects.toThrow('Failed to stop audio recording');
    });
  });

  describe('Audio level monitoring', () => {
    beforeEach(async () => {
      mockAudio.setAudioModeAsync.mockResolvedValue(undefined);
      mockRecording.prepareToRecordAsync.mockResolvedValue(undefined);
      mockRecording.startAsync.mockResolvedValue(undefined);
      mockRecording.getStatusAsync.mockResolvedValue({
        isRecording: true,
        metering: -20, // dB level
      });
    });

    it('should return empty audio levels initially', () => {
      const levels = audioManager.getAudioLevels();
      expect(levels).toEqual([]);
    });

    it('should monitor audio levels during recording', async () => {
      await audioManager.startRecording();
      
      // Wait for level monitoring to update
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const levels = audioManager.getAudioLevels();
      expect(Array.isArray(levels)).toBe(true);
    });
  });

  describe('Recording status', () => {
    it('should return correct status when not recording', async () => {
      const status = await audioManager.getRecordingStatus();
      
      expect(status).toEqual({
        isRecording: false,
        duration: 0,
      });
    });

    it('should return recording status when recording', async () => {
      mockAudio.setAudioModeAsync.mockResolvedValue(undefined);
      mockRecording.prepareToRecordAsync.mockResolvedValue(undefined);
      mockRecording.startAsync.mockResolvedValue(undefined);
      mockRecording.getStatusAsync.mockResolvedValue({
        isRecording: true,
        durationMillis: 5000,
        metering: -15,
      });
      
      await audioManager.startRecording();
      const status = await audioManager.getRecordingStatus();
      
      expect(status.isRecording).toBe(true);
      expect(status.duration).toBe(5000);
      expect(status.metering).toBe(-15);
    });
  });

  describe('Recording cancellation', () => {
    it('should cancel recording successfully', async () => {
      mockAudio.setAudioModeAsync.mockResolvedValue(undefined);
      mockRecording.prepareToRecordAsync.mockResolvedValue(undefined);
      mockRecording.startAsync.mockResolvedValue(undefined);
      mockRecording.stopAndUnloadAsync.mockResolvedValue(undefined);
      
      await audioManager.startRecording();
      await audioManager.cancelRecording();
      
      expect(mockRecording.stopAndUnloadAsync).toHaveBeenCalled();
      expect(audioManager.isRecording()).toBe(false);
    });

    it('should handle cancellation when not recording', async () => {
      await expect(audioManager.cancelRecording()).resolves.toBeUndefined();
    });
  });

  describe('Audio format', () => {
    it('should return correct audio format information', () => {
      const format = audioManager.getAudioFormat();
      
      expect(format).toEqual({
        sampleRate: 44100,
        channels: 1,
        bitRate: 128000,
        format: 'm4a',
      });
    });
  });

  describe('Cleanup and disposal', () => {
    it('should dispose properly', async () => {
      mockAudio.setAudioModeAsync.mockResolvedValue(undefined);
      mockRecording.prepareToRecordAsync.mockResolvedValue(undefined);
      mockRecording.startAsync.mockResolvedValue(undefined);
      mockRecording.stopAndUnloadAsync.mockResolvedValue(undefined);
      
      await audioManager.startRecording();
      audioManager.dispose();
      
      expect(audioManager.isRecording()).toBe(false);
    });
  });
});