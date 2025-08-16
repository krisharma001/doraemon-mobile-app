import { useSettingsStore } from '../settingsStore';

// Mock AsyncStorage for testing
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

describe('SettingsStore', () => {
  beforeEach(() => {
    // Reset settings to default before each test
    useSettingsStore.getState().resetSettings();
  });

  describe('Settings management', () => {
    it('should have default settings', () => {
      const { settings } = useSettingsStore.getState();
      
      expect(settings.ttsEnabled).toBe(true);
      expect(settings.asrBackend).toBe('default');
      expect(settings.theme).toBe('dark');
      expect(settings.privacyMode).toBe(false);
    });

    it('should update settings', () => {
      const { updateSettings } = useSettingsStore.getState();
      
      updateSettings({
        ttsEnabled: false,
        asrBackend: 'whisper',
      });
      
      const { settings } = useSettingsStore.getState();
      expect(settings.ttsEnabled).toBe(false);
      expect(settings.asrBackend).toBe('whisper');
      expect(settings.theme).toBe('dark'); // Should remain unchanged
    });

    it('should reset settings', () => {
      const { updateSettings, resetSettings } = useSettingsStore.getState();
      
      // Change settings
      updateSettings({
        ttsEnabled: false,
        theme: 'light',
      });
      
      // Reset
      resetSettings();
      
      const { settings } = useSettingsStore.getState();
      expect(settings.ttsEnabled).toBe(true);
      expect(settings.theme).toBe('dark');
    });
  });

  describe('Individual setting actions', () => {
    it('should set TTS enabled', () => {
      const { setTTSEnabled } = useSettingsStore.getState();
      
      setTTSEnabled(false);
      expect(useSettingsStore.getState().settings.ttsEnabled).toBe(false);
      
      setTTSEnabled(true);
      expect(useSettingsStore.getState().settings.ttsEnabled).toBe(true);
    });

    it('should set ASR backend', () => {
      const { setASRBackend } = useSettingsStore.getState();
      
      setASRBackend('whisper');
      expect(useSettingsStore.getState().settings.asrBackend).toBe('whisper');
      
      setASRBackend('google');
      expect(useSettingsStore.getState().settings.asrBackend).toBe('google');
    });

    it('should set theme', () => {
      const { setTheme } = useSettingsStore.getState();
      
      setTheme('light');
      expect(useSettingsStore.getState().settings.theme).toBe('light');
      
      setTheme('dark');
      expect(useSettingsStore.getState().settings.theme).toBe('dark');
    });

    it('should set privacy mode', () => {
      const { setPrivacyMode } = useSettingsStore.getState();
      
      setPrivacyMode(true);
      expect(useSettingsStore.getState().settings.privacyMode).toBe(true);
      
      setPrivacyMode(false);
      expect(useSettingsStore.getState().settings.privacyMode).toBe(false);
    });
  });

  describe('Utility operations', () => {
    it('should export settings', () => {
      const { updateSettings, exportSettings } = useSettingsStore.getState();
      
      updateSettings({
        ttsEnabled: false,
        asrBackend: 'whisper',
      });
      
      const exported = exportSettings();
      
      expect(exported.ttsEnabled).toBe(false);
      expect(exported.asrBackend).toBe('whisper');
    });

    it('should import valid settings', () => {
      const { importSettings } = useSettingsStore.getState();
      
      const newSettings = {
        ttsEnabled: false,
        asrBackend: 'google' as const,
        theme: 'light' as const,
        privacyMode: true,
      };
      
      importSettings(newSettings);
      
      const { settings } = useSettingsStore.getState();
      expect(settings).toEqual(newSettings);
    });

    it('should reject invalid settings on import', () => {
      const { importSettings } = useSettingsStore.getState();
      const originalSettings = useSettingsStore.getState().settings;
      
      const invalidSettings = {
        ttsEnabled: 'invalid' as any,
        asrBackend: 'invalid' as any,
        theme: 'dark' as const,
        privacyMode: false,
      };
      
      // Mock console.warn to avoid test output
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      importSettings(invalidSettings);
      
      // Settings should remain unchanged
      expect(useSettingsStore.getState().settings).toEqual(originalSettings);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Validation', () => {
    it('should validate correct settings', () => {
      const { validateSettings } = useSettingsStore.getState();
      
      const validSettings = {
        ttsEnabled: true,
        asrBackend: 'whisper' as const,
        theme: 'light' as const,
        privacyMode: false,
      };
      
      expect(validateSettings(validSettings)).toBe(true);
    });

    it('should reject invalid TTS setting', () => {
      const { validateSettings } = useSettingsStore.getState();
      
      const invalidSettings = {
        ttsEnabled: 'invalid' as any,
      };
      
      expect(validateSettings(invalidSettings)).toBe(false);
    });

    it('should reject invalid ASR backend', () => {
      const { validateSettings } = useSettingsStore.getState();
      
      const invalidSettings = {
        asrBackend: 'invalid' as any,
      };
      
      expect(validateSettings(invalidSettings)).toBe(false);
    });

    it('should reject invalid theme', () => {
      const { validateSettings } = useSettingsStore.getState();
      
      const invalidSettings = {
        theme: 'invalid' as any,
      };
      
      expect(validateSettings(invalidSettings)).toBe(false);
    });

    it('should reject invalid privacy mode', () => {
      const { validateSettings } = useSettingsStore.getState();
      
      const invalidSettings = {
        privacyMode: 'invalid' as any,
      };
      
      expect(validateSettings(invalidSettings)).toBe(false);
    });

    it('should validate partial settings', () => {
      const { validateSettings } = useSettingsStore.getState();
      
      expect(validateSettings({ ttsEnabled: true })).toBe(true);
      expect(validateSettings({ theme: 'light' })).toBe(true);
      expect(validateSettings({})).toBe(true);
    });
  });
});