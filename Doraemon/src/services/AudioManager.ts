import { Audio } from 'expo-av';
import { AudioManager as IAudioManager } from '../types/services';

interface AudioLevelData {
  level: number;
  timestamp: number;
}

export class AudioManager implements IAudioManager {
  private static instance: AudioManager;
  private recording: Audio.Recording | null = null;
  private audioLevels: number[] = [];
  private levelMonitoringInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  // Audio configuration
  private readonly recordingOptions: Audio.RecordingOptions = {
    android: {
      extension: '.m4a',
      outputFormat: 2, // MPEG_4
      audioEncoder: 3, // AAC
      sampleRate: 44100,
      numberOfChannels: 1,
      bitRate: 128000,
    },
    ios: {
      extension: '.m4a',
      outputFormat: 'kAudioFormatMPEG4AAC',
      audioQuality: 'high' as any,
      sampleRate: 44100,
      numberOfChannels: 1,
      bitRate: 128000,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
    web: {
      mimeType: 'audio/webm',
      bitsPerSecond: 128000,
    },
  };

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Initialize audio system and request permissions
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });

      this.isInitialized = true;
      console.log('AudioManager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AudioManager:', error);
      throw new Error('Audio initialization failed');
    }
  }

  /**
   * Request microphone permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting audio permissions:', error);
      return false;
    }
  }

  /**
   * Start audio recording
   */
  async startRecording(): Promise<void> {
    try {
      // Initialize if not already done
      await this.initialize();

      // Check if already recording
      if (this.recording) {
        console.warn('Recording already in progress');
        return;
      }

      // Create new recording
      this.recording = new Audio.Recording();
      
      // Prepare recording with options
      await this.recording.prepareToRecordAsync(this.recordingOptions);
      
      // Start recording
      await this.recording.startAsync();
      
      // Start monitoring audio levels
      this.startLevelMonitoring();
      
      console.log('Audio recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      this.cleanup();
      throw new Error('Failed to start audio recording');
    }
  }

  /**
   * Stop audio recording and return the audio buffer
   */
  async stopRecording(): Promise<ArrayBuffer> {
    try {
      if (!this.recording) {
        throw new Error('No recording in progress');
      }

      // Stop level monitoring
      this.stopLevelMonitoring();

      // Stop recording
      await this.recording.stopAndUnloadAsync();
      
      // Get recording URI
      const uri = this.recording.getURI();
      if (!uri) {
        throw new Error('Failed to get recording URI');
      }

      // Read the audio file as ArrayBuffer
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();

      console.log('Audio recording stopped, size:', arrayBuffer.byteLength);
      
      // Cleanup
      this.cleanup();
      
      return arrayBuffer;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      this.cleanup();
      throw new Error('Failed to stop audio recording');
    }
  }

  /**
   * Get current audio levels for waveform visualization
   */
  getAudioLevels(): number[] {
    return [...this.audioLevels];
  }

  /**
   * Check if currently recording
   */
  isRecording(): boolean {
    return this.recording !== null;
  }

  /**
   * Start monitoring audio levels for real-time visualization
   */
  private startLevelMonitoring(): void {
    if (this.levelMonitoringInterval) {
      clearInterval(this.levelMonitoringInterval);
    }

    this.audioLevels = [];
    
    this.levelMonitoringInterval = setInterval(async () => {
      try {
        if (this.recording) {
          const status = await this.recording.getStatusAsync();
          
          if (status.isRecording && status.metering !== undefined) {
            // Convert metering to normalized level (0-1)
            // Expo's metering is typically in dB, ranging from -160 to 0
            const dbLevel = status.metering;
            const normalizedLevel = Math.max(0, Math.min(1, (dbLevel + 160) / 160));
            
            // Add some smoothing and ensure we have a reasonable level
            const smoothedLevel = Math.max(0.1, normalizedLevel);
            
            // Keep only the last 50 levels for performance
            this.audioLevels.push(smoothedLevel);
            if (this.audioLevels.length > 50) {
              this.audioLevels.shift();
            }
          }
        }
      } catch (error) {
        console.error('Error monitoring audio levels:', error);
      }
    }, 100); // Update every 100ms for smooth visualization
  }

  /**
   * Stop monitoring audio levels
   */
  private stopLevelMonitoring(): void {
    if (this.levelMonitoringInterval) {
      clearInterval(this.levelMonitoringInterval);
      this.levelMonitoringInterval = null;
    }
  }

  /**
   * Cleanup recording resources
   */
  private cleanup(): void {
    this.stopLevelMonitoring();
    this.recording = null;
    this.audioLevels = [];
  }

  /**
   * Get recording status information
   */
  async getRecordingStatus(): Promise<{
    isRecording: boolean;
    duration: number;
    metering?: number;
  }> {
    if (!this.recording) {
      return {
        isRecording: false,
        duration: 0,
      };
    }

    try {
      const status = await this.recording.getStatusAsync();
      return {
        isRecording: status.isRecording || false,
        duration: status.durationMillis || 0,
        metering: status.metering,
      };
    } catch (error) {
      console.error('Error getting recording status:', error);
      return {
        isRecording: false,
        duration: 0,
      };
    }
  }

  /**
   * Cancel current recording without saving
   */
  async cancelRecording(): Promise<void> {
    try {
      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
        console.log('Recording cancelled');
      }
    } catch (error) {
      console.error('Error cancelling recording:', error);
    } finally {
      this.cleanup();
    }
  }

  /**
   * Get audio format information
   */
  getAudioFormat(): {
    sampleRate: number;
    channels: number;
    bitRate: number;
    format: string;
  } {
    return {
      sampleRate: 44100,
      channels: 1,
      bitRate: 128000,
      format: 'm4a',
    };
  }

  /**
   * Dispose of the AudioManager instance
   */
  dispose(): void {
    this.cleanup();
    this.isInitialized = false;
    AudioManager.instance = null as any;
  }
}