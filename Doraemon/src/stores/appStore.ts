import { create } from 'zustand';
import { AppState } from '../types';

interface AppStore extends AppState {
  // Actions for state transitions
  setCurrentState: (state: AppState['currentState']) => void;
  setConnectionStatus: (isConnected: boolean) => void;
  setPermissions: (hasPermissions: boolean) => void;
  
  // Audio state actions
  setAudioLevels: (levels: number[]) => void;
  setRecordingStatus: (isRecording: boolean) => void;
  setTranscript: (transcript: string, isPartial: boolean) => void;
  clearTranscript: () => void;
  
  // Settings actions
  updateSettings: (settings: Partial<AppState['settings']>) => void;
  toggleTTS: () => void;
  setASRBackend: (backend: AppState['settings']['asrBackend']) => void;
  setTheme: (theme: AppState['settings']['theme']) => void;
  togglePrivacyMode: () => void;
  
  // Error handling actions
  setError: (error: AppState['lastError']) => void;
  clearError: () => void;
  
  // Reset actions
  resetAudioState: () => void;
  resetToIdle: () => void;
}

const initialState: AppState = {
  // Interaction State
  currentState: 'idle',
  isConnected: false,
  hasPermissions: false,
  
  // Audio State
  audioLevels: [],
  isRecording: false,
  currentTranscript: '',
  isTranscriptPartial: false,
  
  // Settings
  settings: {
    ttsEnabled: true,
    asrBackend: 'default',
    theme: 'dark',
    privacyMode: false,
  },
  
  // Error Handling
  lastError: undefined,
};

export const useAppStore = create<AppStore>((set, get) => ({
  ...initialState,
  
  // State transition actions
  setCurrentState: (currentState) => set({ currentState }),
  
  setConnectionStatus: (isConnected) => set({ isConnected }),
  
  setPermissions: (hasPermissions) => set({ hasPermissions }),
  
  // Audio state actions
  setAudioLevels: (audioLevels) => set({ audioLevels }),
  
  setRecordingStatus: (isRecording) => set({ isRecording }),
  
  setTranscript: (currentTranscript, isTranscriptPartial) => 
    set({ currentTranscript, isTranscriptPartial }),
  
  clearTranscript: () => set({ 
    currentTranscript: '', 
    isTranscriptPartial: false 
  }),
  
  // Settings actions
  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  })),
  
  toggleTTS: () => set((state) => ({
    settings: { ...state.settings, ttsEnabled: !state.settings.ttsEnabled }
  })),
  
  setASRBackend: (asrBackend) => set((state) => ({
    settings: { ...state.settings, asrBackend }
  })),
  
  setTheme: (theme) => set((state) => ({
    settings: { ...state.settings, theme }
  })),
  
  togglePrivacyMode: () => set((state) => ({
    settings: { ...state.settings, privacyMode: !state.settings.privacyMode }
  })),
  
  // Error handling actions
  setError: (lastError) => set({ lastError }),
  
  clearError: () => set({ lastError: undefined }),
  
  // Reset actions
  resetAudioState: () => set({
    audioLevels: [],
    isRecording: false,
    currentTranscript: '',
    isTranscriptPartial: false,
  }),
  
  resetToIdle: () => set({
    currentState: 'idle',
    audioLevels: [],
    isRecording: false,
    currentTranscript: '',
    isTranscriptPartial: false,
    lastError: undefined,
  }),
}));