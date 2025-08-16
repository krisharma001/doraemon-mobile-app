import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from '../types';

interface SettingsStore {
  settings: AppState['settings'];
  
  // Settings actions
  updateSettings: (settings: Partial<AppState['settings']>) => void;
  resetSettings: () => void;
  
  // Individual setting actions
  setTTSEnabled: (enabled: boolean) => void;
  setASRBackend: (backend: AppState['settings']['asrBackend']) => void;
  setTheme: (theme: AppState['settings']['theme']) => void;
  setPrivacyMode: (enabled: boolean) => void;
  
  // Utility actions
  exportSettings: () => AppState['settings'];
  importSettings: (settings: AppState['settings']) => void;
  
  // Validation
  validateSettings: (settings: Partial<AppState['settings']>) => boolean;
}

const defaultSettings: AppState['settings'] = {
  ttsEnabled: true,
  asrBackend: 'default',
  theme: 'dark',
  privacyMode: false,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      
      // Settings actions
      updateSettings: (newSettings) => {
        const { validateSettings } = get();
        
        if (!validateSettings(newSettings)) {
          console.warn('Invalid settings provided:', newSettings);
          return;
        }
        
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },
      
      resetSettings: () => set({ settings: defaultSettings }),
      
      // Individual setting actions
      setTTSEnabled: (ttsEnabled) => set((state) => ({
        settings: { ...state.settings, ttsEnabled }
      })),
      
      setASRBackend: (asrBackend) => set((state) => ({
        settings: { ...state.settings, asrBackend }
      })),
      
      setTheme: (theme) => set((state) => ({
        settings: { ...state.settings, theme }
      })),
      
      setPrivacyMode: (privacyMode) => set((state) => ({
        settings: { ...state.settings, privacyMode }
      })),
      
      // Utility actions
      exportSettings: () => get().settings,
      
      importSettings: (settings) => {
        const { validateSettings } = get();
        
        if (validateSettings(settings)) {
          set({ settings });
        } else {
          console.warn('Invalid settings for import:', settings);
        }
      },
      
      // Validation
      validateSettings: (settings) => {
        if (settings.ttsEnabled !== undefined && typeof settings.ttsEnabled !== 'boolean') {
          return false;
        }
        
        if (settings.asrBackend !== undefined && 
            !['default', 'whisper', 'google'].includes(settings.asrBackend)) {
          return false;
        }
        
        if (settings.theme !== undefined && 
            !['dark', 'light'].includes(settings.theme)) {
          return false;
        }
        
        if (settings.privacyMode !== undefined && typeof settings.privacyMode !== 'boolean') {
          return false;
        }
        
        return true;
      },
    }),
    {
      name: 'doraemon-settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);