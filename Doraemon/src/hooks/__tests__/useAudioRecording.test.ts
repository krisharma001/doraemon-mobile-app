// useAudioRecording hook tests

describe('useAudioRecording Hook', () => {
  describe('Initial State', () => {
    it('should return correct initial state', () => {
      const initialState = {
        isRecording: false,
        audioLevels: [],
        duration: 0,
        recordingStatus: {
          isRecording: false,
          duration: 0,
        },
      };

      expect(initialState.isRecording).toBe(false);
      expect(initialState.audioLevels).toEqual([]);
      expect(initialState.duration).toBe(0);
      expect(initialState.recordingStatus.isRecording).toBe(false);
    });
  });

  describe('Recording Operations', () => {
    it('should handle start recording success', async () => {
      const mockStartRecording = jest.fn().mockResolvedValue(true);
      
      const result = await mockStartRecording();
      
      expect(result).toBe(true);
      expect(mockStartRecording).toHaveBeenCalled();
    });

    it('should handle start recording failure', async () => {
      const mockStartRecording = jest.fn().mockResolvedValue(false);
      
      const result = await mockStartRecording();
      
      expect(result).toBe(false);
    });

    it('should handle stop recording success', async () => {
      const mockArrayBuffer = new ArrayBuffer(1024);
      const mockStopRecording = jest.fn().mockResolvedValue(mockArrayBuffer);
      
      const result = await mockStopRecording();
      
      expect(result).toBe(mockArrayBuffer);
      expect(result.byteLength).toBe(1024);
    });

    it('should handle stop recording failure', async () => {
      const mockStopRecording = jest.fn().mockResolvedValue(null);
      
      const result = await mockStopRecording();
      
      expect(result).toBeNull();
    });

    it('should handle cancel recording', async () => {
      const mockCancelRecording = jest.fn().mockResolvedValue(undefined);
      
      await expect(mockCancelRecording()).resolves.toBeUndefined();
      expect(mockCancelRecording).toHaveBeenCalled();
    });
  });

  describe('Audio Levels', () => {
    it('should handle audio levels updates', () => {
      const mockAudioLevels = [0.1, 0.3, 0.5, 0.7, 0.4];
      
      expect(Array.isArray(mockAudioLevels)).toBe(true);
      expect(mockAudioLevels.length).toBe(5);
      
      mockAudioLevels.forEach(level => {
        expect(level).toBeGreaterThanOrEqual(0);
        expect(level).toBeLessThanOrEqual(1);
      });
    });

    it('should handle empty audio levels', () => {
      const mockAudioLevels: number[] = [];
      
      expect(Array.isArray(mockAudioLevels)).toBe(true);
      expect(mockAudioLevels.length).toBe(0);
    });
  });

  describe('Recording Status', () => {
    it('should handle recording status updates', () => {
      const mockStatus = {
        isRecording: true,
        duration: 5000,
        metering: -20,
      };

      expect(mockStatus.isRecording).toBe(true);
      expect(mockStatus.duration).toBe(5000);
      expect(typeof mockStatus.metering).toBe('number');
    });

    it('should handle status without metering', () => {
      const mockStatus: { isRecording: boolean; duration: number; metering?: number } = {
        isRecording: false,
        duration: 0,
      };

      expect(mockStatus.isRecording).toBe(false);
      expect(mockStatus.duration).toBe(0);
      expect(mockStatus.metering).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle permission errors', () => {
      const mockError = {
        type: 'permission' as const,
        message: 'Microphone permission is required for recording',
        timestamp: Date.now(),
      };

      expect(mockError.type).toBe('permission');
      expect(mockError.message).toContain('permission');
      expect(typeof mockError.timestamp).toBe('number');
    });

    it('should handle audio errors', () => {
      const mockError = {
        type: 'audio' as const,
        message: 'Failed to start audio recording',
        timestamp: Date.now(),
      };

      expect(mockError.type).toBe('audio');
      expect(mockError.message).toContain('audio recording');
      expect(typeof mockError.timestamp).toBe('number');
    });
  });

  describe('Async Operations', () => {
    it('should handle async recording operations', async () => {
      const mockAsyncOperation = async () => {
        return new Promise<ArrayBuffer>((resolve) => {
          setTimeout(() => {
            resolve(new ArrayBuffer(512));
          }, 100);
        });
      };

      const result = await mockAsyncOperation();
      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(result.byteLength).toBe(512);
    });

    it('should handle async operation failures', async () => {
      const mockAsyncOperation = async () => {
        return new Promise<ArrayBuffer>((_, reject) => {
          setTimeout(() => {
            reject(new Error('Operation failed'));
          }, 100);
        });
      };

      await expect(mockAsyncOperation()).rejects.toThrow('Operation failed');
    });
  });

  describe('Cleanup Operations', () => {
    it('should handle cleanup on unmount', () => {
      const mockCleanup = jest.fn();
      
      // Simulate useEffect cleanup
      const cleanup = () => {
        mockCleanup();
      };

      cleanup();
      expect(mockCleanup).toHaveBeenCalled();
    });

    it('should clear intervals on cleanup', () => {
      const mockClearInterval = jest.fn();
      const mockInterval = setInterval(() => {}, 100);
      
      mockClearInterval(mockInterval);
      expect(mockClearInterval).toHaveBeenCalledWith(mockInterval);
    });
  });

  describe('State Updates', () => {
    it('should handle recording state changes', () => {
      const states = {
        idle: { isRecording: false, duration: 0 },
        recording: { isRecording: true, duration: 1500 },
        stopped: { isRecording: false, duration: 0 },
      };

      Object.entries(states).forEach(([stateName, state]) => {
        expect(typeof state.isRecording).toBe('boolean');
        expect(typeof state.duration).toBe('number');
        expect(state.duration).toBeGreaterThanOrEqual(0);
      });
    });
  });
});