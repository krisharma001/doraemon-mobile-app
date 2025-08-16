import { Audio } from 'expo-av';
import { Linking, Alert, Platform } from 'react-native';
import { PermissionManager as IPermissionManager } from '../types/services';

export class PermissionManager implements IPermissionManager {
  private static instance: PermissionManager;

  public static getInstance(): PermissionManager {
    if (!PermissionManager.instance) {
      PermissionManager.instance = new PermissionManager();
    }
    return PermissionManager.instance;
  }

  /**
   * Request microphone permission from the user
   * @returns Promise<boolean> - true if permission granted, false otherwise
   */
  async requestMicrophonePermission(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      return false;
    }
  }

  /**
   * Check current microphone permission status
   * @returns Promise<boolean> - true if permission granted, false otherwise
   */
  async checkMicrophonePermission(): Promise<boolean> {
    try {
      const { status } = await Audio.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking microphone permission:', error);
      return false;
    }
  }

  /**
   * Open device settings for the app
   */
  openAppSettings(): void {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  }

  /**
   * Show permission explanation dialog
   * @param onRetry - Callback when user wants to retry permission request
   * @param onCancel - Callback when user cancels
   */
  showPermissionDialog(
    onRetry: () => void,
    onCancel: () => void
  ): void {
    Alert.alert(
      'Microphone Permission Required',
      'Doraemon needs access to your microphone to listen to your voice commands and provide AI assistance. This permission is essential for the app to function properly.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: onCancel,
        },
        {
          text: 'Grant Permission',
          onPress: onRetry,
        },
      ]
    );
  }

  /**
   * Show permission denied dialog with settings option
   * @param onOpenSettings - Callback when user wants to open settings
   * @param onCancel - Callback when user cancels
   */
  showPermissionDeniedDialog(
    onOpenSettings: () => void,
    onCancel: () => void
  ): void {
    Alert.alert(
      'Microphone Permission Denied',
      'Doraemon cannot function without microphone access. You can enable it in your device settings.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: onCancel,
        },
        {
          text: 'Open Settings',
          onPress: () => {
            this.openAppSettings();
            onOpenSettings();
          },
        },
      ]
    );
  }

  /**
   * Handle permission request with user-friendly flow
   * @returns Promise<boolean> - true if permission granted, false otherwise
   */
  async handlePermissionRequest(): Promise<boolean> {
    // First check if we already have permission
    const hasPermission = await this.checkMicrophonePermission();
    if (hasPermission) {
      return true;
    }

    // Request permission
    const granted = await this.requestMicrophonePermission();
    if (granted) {
      return true;
    }

    // Permission denied - show explanation
    return new Promise((resolve) => {
      this.showPermissionDeniedDialog(
        () => resolve(false), // onOpenSettings
        () => resolve(false)  // onCancel
      );
    });
  }

  /**
   * Initialize audio mode for recording
   */
  async initializeAudioMode(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });
    } catch (error) {
      console.error('Error initializing audio mode:', error);
      throw new Error('Failed to initialize audio mode');
    }
  }

  /**
   * Get permission status as string for debugging
   */
  async getPermissionStatusString(): Promise<string> {
    try {
      const { status } = await Audio.getPermissionsAsync();
      return status;
    } catch (error) {
      return 'error';
    }
  }
}