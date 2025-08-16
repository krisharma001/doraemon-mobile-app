import { PermissionManager } from '../PermissionManager';
import { Audio } from 'expo-av';
import { Alert, Linking, Platform } from 'react-native';

// Mock expo-av
jest.mock('expo-av', () => ({
  Audio: {
    requestPermissionsAsync: jest.fn(),
    getPermissionsAsync: jest.fn(),
    setAudioModeAsync: jest.fn(),
  },
}));

// Mock React Native modules
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
  Linking: {
    openURL: jest.fn(),
    openSettings: jest.fn(),
  },
  Platform: {
    OS: 'ios',
  },
}));

const mockAudio = Audio as jest.Mocked<typeof Audio>;
const mockAlert = Alert as jest.Mocked<typeof Alert>;
const mockLinking = Linking as jest.Mocked<typeof Linking>;

describe('PermissionManager', () => {
  let permissionManager: PermissionManager;

  beforeEach(() => {
    permissionManager = PermissionManager.getInstance();
    jest.clearAllMocks();
  });

  describe('Singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = PermissionManager.getInstance();
      const instance2 = PermissionManager.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('requestMicrophonePermission', () => {
    it('should return true when permission is granted', async () => {
      mockAudio.requestPermissionsAsync.mockResolvedValue({ status: 'granted' } as any);
      
      const result = await permissionManager.requestMicrophonePermission();
      
      expect(result).toBe(true);
      expect(mockAudio.requestPermissionsAsync).toHaveBeenCalled();
    });

    it('should return false when permission is denied', async () => {
      mockAudio.requestPermissionsAsync.mockResolvedValue({ status: 'denied' } as any);
      
      const result = await permissionManager.requestMicrophonePermission();
      
      expect(result).toBe(false);
    });

    it('should return false when request fails', async () => {
      mockAudio.requestPermissionsAsync.mockRejectedValue(new Error('Request failed'));
      
      const result = await permissionManager.requestMicrophonePermission();
      
      expect(result).toBe(false);
    });
  });

  describe('checkMicrophonePermission', () => {
    it('should return true when permission is granted', async () => {
      mockAudio.getPermissionsAsync.mockResolvedValue({ status: 'granted' } as any);
      
      const result = await permissionManager.checkMicrophonePermission();
      
      expect(result).toBe(true);
      expect(mockAudio.getPermissionsAsync).toHaveBeenCalled();
    });

    it('should return false when permission is denied', async () => {
      mockAudio.getPermissionsAsync.mockResolvedValue({ status: 'denied' } as any);
      
      const result = await permissionManager.checkMicrophonePermission();
      
      expect(result).toBe(false);
    });

    it('should return false when check fails', async () => {
      mockAudio.getPermissionsAsync.mockRejectedValue(new Error('Check failed'));
      
      const result = await permissionManager.checkMicrophonePermission();
      
      expect(result).toBe(false);
    });
  });

  describe('openAppSettings', () => {
    it('should open app settings on iOS', () => {
      (Platform as any).OS = 'ios';
      
      permissionManager.openAppSettings();
      
      expect(mockLinking.openURL).toHaveBeenCalledWith('app-settings:');
    });

    it('should open settings on Android', () => {
      (Platform as any).OS = 'android';
      
      permissionManager.openAppSettings();
      
      expect(mockLinking.openSettings).toHaveBeenCalled();
    });
  });

  describe('showPermissionDialog', () => {
    it('should show permission dialog with correct options', () => {
      const onRetry = jest.fn();
      const onCancel = jest.fn();
      
      permissionManager.showPermissionDialog(onRetry, onCancel);
      
      expect(mockAlert.alert).toHaveBeenCalledWith(
        'Microphone Permission Required',
        expect.stringContaining('Doraemon needs access to your microphone'),
        expect.arrayContaining([
          expect.objectContaining({ text: 'Cancel' }),
          expect.objectContaining({ text: 'Grant Permission' }),
        ])
      );
    });
  });

  describe('showPermissionDeniedDialog', () => {
    it('should show permission denied dialog with settings option', () => {
      const onOpenSettings = jest.fn();
      const onCancel = jest.fn();
      
      permissionManager.showPermissionDeniedDialog(onOpenSettings, onCancel);
      
      expect(mockAlert.alert).toHaveBeenCalledWith(
        'Microphone Permission Denied',
        expect.stringContaining('Doraemon cannot function without microphone access'),
        expect.arrayContaining([
          expect.objectContaining({ text: 'Cancel' }),
          expect.objectContaining({ text: 'Open Settings' }),
        ])
      );
    });
  });

  describe('handlePermissionRequest', () => {
    it('should return true if permission already granted', async () => {
      mockAudio.getPermissionsAsync.mockResolvedValue({ status: 'granted' } as any);
      
      const result = await permissionManager.handlePermissionRequest();
      
      expect(result).toBe(true);
      expect(mockAudio.requestPermissionsAsync).not.toHaveBeenCalled();
    });

    it('should request permission if not already granted', async () => {
      mockAudio.getPermissionsAsync.mockResolvedValue({ status: 'denied' } as any);
      mockAudio.requestPermissionsAsync.mockResolvedValue({ status: 'granted' } as any);
      
      const result = await permissionManager.handlePermissionRequest();
      
      expect(result).toBe(true);
      expect(mockAudio.requestPermissionsAsync).toHaveBeenCalled();
    });
  });

  describe('initializeAudioMode', () => {
    it('should initialize audio mode successfully', async () => {
      mockAudio.setAudioModeAsync.mockResolvedValue(undefined);
      
      await expect(permissionManager.initializeAudioMode()).resolves.toBeUndefined();
      
      expect(mockAudio.setAudioModeAsync).toHaveBeenCalledWith({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });
    });

    it('should throw error when initialization fails', async () => {
      mockAudio.setAudioModeAsync.mockRejectedValue(new Error('Init failed'));
      
      await expect(permissionManager.initializeAudioMode()).rejects.toThrow('Failed to initialize audio mode');
    });
  });

  describe('getPermissionStatusString', () => {
    it('should return permission status string', async () => {
      mockAudio.getPermissionsAsync.mockResolvedValue({ status: 'granted' } as any);
      
      const status = await permissionManager.getPermissionStatusString();
      
      expect(status).toBe('granted');
    });

    it('should return error when check fails', async () => {
      mockAudio.getPermissionsAsync.mockRejectedValue(new Error('Check failed'));
      
      const status = await permissionManager.getPermissionStatusString();
      
      expect(status).toBe('error');
    });
  });
});