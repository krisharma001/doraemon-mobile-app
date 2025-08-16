import { useAppStore } from '../appStore';

// Mock the store for testing
const mockStore = useAppStore.getState();

describe('AppStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useAppStore.getState().resetToIdle();
    useAppStore.getState().clearError();
  });

  describe('State transitions', () => {
    it('should set current state', () => {
      const { setCurrentState } = useAppStore.getState();
      
      setCurrentState('listening');
      expect(useAppStore.getState().currentState).toBe('listening');
      
      setCurrentState('processing');
      expect(useAppStore.getState().currentState).toBe('processing');
    });

    it('should set connection status', () => {
      const { setConnectionStatus } = useAppStore.getState();
      
      setConnectionStatus(true);
      expect(useAppStore.getState().isConnected).toBe(true);
      
      setConnectionStatus(false);
      expect(useAppStore.getState().isConnected).toBe(false);
    });

    it('should set permissions', () => {
      const { setPermissions } = useAppStore.getState();
      
      setPermissions(true);
      expect(useAppStore.getState().hasPermissions).toBe(true);
    });
  });

  describe('Audio state management', () => {
    it('should set audio levels', () => {
      const { setAudioLevels } = useAppStore.getState();
      const levels = [0.1, 0.5, 0.8, 0.3];
      
      setAudioLevels(levels);
      expect(useAppStore.getState().audioLevels).toEqual(levels);
    });

    it('should set recording status', () => {
      const { setRecordingStatus } = useAppStore.getState();
      
      setRecordingStatus(true);
      expect(useAppStore.getState().isRecording).toBe(true);
    });

    it('should set transcript', () => {
      const { setTranscript } = useAppStore.getState();
      
      setTranscript('Hello Doraemon', true);
      expect(useAppStore.getState().currentTranscript).toBe('Hello Doraemon');
      expect(useAppStore.getState().isTranscriptPartial).toBe(true);
    });

    it('should clear transcript', () => {
      const { setTranscript, clearTranscript } = useAppStore.getState();
      
      setTranscript('Test transcript', false);
      clearTranscript();
      
      expect(useAppStore.getState().currentTranscript).toBe('');
      expect(useAppStore.getState().isTranscriptPartial).toBe(false);
    });
  });

  describe('Settings management', () => {
    it('should update settings', () => {
      const { updateSettings } = useAppStore.getState();
      
      updateSettings({ ttsEnabled: false, asrBackend: 'whisper' });
      
      const settings = useAppStore.getState().settings;
      expect(settings.ttsEnabled).toBe(false);
      expect(settings.asrBackend).toBe('whisper');
    });

    it('should toggle TTS', () => {
      const { toggleTTS } = useAppStore.getState();
      const initialTTS = useAppStore.getState().settings.ttsEnabled;
      
      toggleTTS();
      expect(useAppStore.getState().settings.ttsEnabled).toBe(!initialTTS);
    });

    it('should set ASR backend', () => {
      const { setASRBackend } = useAppStore.getState();
      
      setASRBackend('google');
      expect(useAppStore.getState().settings.asrBackend).toBe('google');
    });

    it('should toggle privacy mode', () => {
      const { togglePrivacyMode } = useAppStore.getState();
      const initialPrivacy = useAppStore.getState().settings.privacyMode;
      
      togglePrivacyMode();
      expect(useAppStore.getState().settings.privacyMode).toBe(!initialPrivacy);
    });
  });

  describe('Error handling', () => {
    it('should set error', () => {
      const { setError } = useAppStore.getState();
      const error = {
        type: 'permission' as const,
        message: 'Microphone permission denied',
        timestamp: Date.now(),
      };
      
      setError(error);
      expect(useAppStore.getState().lastError).toEqual(error);
    });

    it('should clear error', () => {
      const { setError, clearError } = useAppStore.getState();
      const error = {
        type: 'network' as const,
        message: 'Connection failed',
        timestamp: Date.now(),
      };
      
      setError(error);
      clearError();
      
      expect(useAppStore.getState().lastError).toBeUndefined();
    });
  });

  describe('Reset operations', () => {
    it('should reset audio state', () => {
      const { setAudioLevels, setRecordingStatus, setTranscript, resetAudioState } = useAppStore.getState();
      
      // Set some audio state
      setAudioLevels([0.5, 0.8]);
      setRecordingStatus(true);
      setTranscript('Test', true);
      
      // Reset
      resetAudioState();
      
      const state = useAppStore.getState();
      expect(state.audioLevels).toEqual([]);
      expect(state.isRecording).toBe(false);
      expect(state.currentTranscript).toBe('');
      expect(state.isTranscriptPartial).toBe(false);
    });

    it('should reset to idle', () => {
      const { setCurrentState, setError, resetToIdle } = useAppStore.getState();
      
      // Set some state
      setCurrentState('processing');
      setError({
        type: 'audio',
        message: 'Audio error',
        timestamp: Date.now(),
      });
      
      // Reset to idle
      resetToIdle();
      
      const state = useAppStore.getState();
      expect(state.currentState).toBe('idle');
      expect(state.lastError).toBeUndefined();
    });
  });
});