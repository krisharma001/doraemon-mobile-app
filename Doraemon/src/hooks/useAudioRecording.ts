import { useState, useEffect, useCallback, useRef } from 'react';
import { AudioManager } from '../services/AudioManager';
import { useAppStore } from '../stores';

interface UseAudioRecordingReturn {
  isRecording: boolean;
  audioLevels: number[];
  duration: number;
  startRecording: () => Promise<boolean>;
  stopRecording: () => Promise<ArrayBuffer | null>;
  cancelRecording: () => Promise<void>;
  recordingStatus: {
    isRecording: boolean;
    duration: number;
    metering?: number;
  };
}

export const useAudioRecording = (): UseAudioRecordingReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevels, setAudioLevels] = useState<number[]>([]);
  const [duration, setDuration] = useState(0);
  const [recordingStatus, setRecordingStatus] = useState({
    isRecording: false,
    duration: 0,
  });

  const { setError, clearError } = useAppStore();
  const audioManager = AudioManager.getInstance();
  const statusInterval = useRef<NodeJS.Timeout | null>(null);
  const levelsInterval = useRef<NodeJS.Timeout | null>(null);

  // Debug: Log when isRecording changes
  useEffect(() => {
    console.log('useAudioRecording: isRecording changed to:', isRecording);
  }, [isRecording]);

  // Update audio levels periodically
  const updateAudioLevels = useCallback(() => {
    const levels = audioManager.getAudioLevels();
    setAudioLevels(levels);
  }, [audioManager]);

  // Update recording status periodically
  const updateRecordingStatus = useCallback(async () => {
    try {
      const status = await audioManager.getRecordingStatus();
      setRecordingStatus(status);
      setDuration(status.duration);
    } catch (error) {
      console.error('Error updating recording status:', error);
    }
  }, [audioManager]);

  // Start periodic updates when recording
  useEffect(() => {
    if (isRecording) {
      // Update audio levels every 100ms for smooth visualization
      levelsInterval.current = setInterval(() => {
        updateAudioLevels();
      }, 100);
      
      // Update status every 500ms
      statusInterval.current = setInterval(() => {
        updateRecordingStatus();
      }, 500);
    } else {
      // Clear intervals when not recording
      if (levelsInterval.current) {
        clearInterval(levelsInterval.current);
        levelsInterval.current = null;
      }
      if (statusInterval.current) {
        clearInterval(statusInterval.current);
        statusInterval.current = null;
      }
      // Clear audio levels when not recording
      setAudioLevels([]);
    }

    return () => {
      if (levelsInterval.current) {
        clearInterval(levelsInterval.current);
      }
      if (statusInterval.current) {
        clearInterval(statusInterval.current);
      }
    };
  }, [isRecording, updateAudioLevels, updateRecordingStatus]);

  const startRecording = useCallback(async (): Promise<boolean> => {
    try {
      console.log('useAudioRecording: startRecording called');
      clearError();
      
      // Check permissions first
      const hasPermission = await audioManager.requestPermissions();
      console.log('useAudioRecording: hasPermission =', hasPermission);
      if (!hasPermission) {
        setError({
          type: 'permission',
          message: 'Microphone permission is required for recording',
          timestamp: Date.now(),
        });
        return false;
      }

      // Start recording
      console.log('useAudioRecording: calling audioManager.startRecording()');
      await audioManager.startRecording();
      console.log('useAudioRecording: setting isRecording to true');
      setIsRecording(true);
      setDuration(0);
      setAudioLevels([]);
      
      console.log('Recording started successfully, isRecording should be true');
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      setError({
        type: 'audio',
        message: 'Failed to start audio recording',
        timestamp: Date.now(),
      });
      setIsRecording(false);
      return false;
    }
  }, [audioManager, setError, clearError]);

  const stopRecording = useCallback(async (): Promise<ArrayBuffer | null> => {
    try {
      if (!isRecording) {
        console.warn('No recording in progress');
        return null;
      }

      const audioBuffer = await audioManager.stopRecording();
      setIsRecording(false);
      setAudioLevels([]);
      setDuration(0);
      setRecordingStatus({ isRecording: false, duration: 0 });
      
      console.log('Recording stopped successfully, buffer size:', audioBuffer.byteLength);
      return audioBuffer;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setError({
        type: 'audio',
        message: 'Failed to stop audio recording',
        timestamp: Date.now(),
      });
      setIsRecording(false);
      setAudioLevels([]);
      return null;
    }
  }, [isRecording, audioManager, setError]);

  const cancelRecording = useCallback(async (): Promise<void> => {
    try {
      await audioManager.cancelRecording();
      setIsRecording(false);
      setAudioLevels([]);
      setDuration(0);
      setRecordingStatus({ isRecording: false, duration: 0 });
      
      console.log('Recording cancelled');
    } catch (error) {
      console.error('Failed to cancel recording:', error);
      setError({
        type: 'audio',
        message: 'Failed to cancel audio recording',
        timestamp: Date.now(),
      });
    }
  }, [audioManager, setError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup intervals on unmount
      if (levelsInterval.current) {
        clearInterval(levelsInterval.current);
      }
      if (statusInterval.current) {
        clearInterval(statusInterval.current);
      }
    };
  }, []);

  return {
    isRecording,
    audioLevels,
    duration,
    startRecording,
    stopRecording,
    cancelRecording,
    recordingStatus,
  };
};