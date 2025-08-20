import { useCallback, useEffect } from 'react';
import { useAppStore } from '../stores';
import { usePermissions } from './usePermissions';
import { useAudioRecording } from './useAudioRecording';

interface UseMicButtonReturn {
  state: 'idle' | 'listening' | 'processing';
  disabled: boolean;
  onPress: () => Promise<void>;
  canRecord: boolean;
}

export const useMicButton = (): UseMicButtonReturn => {
  const { 
    currentState, 
    setCurrentState, 
    setError,
    clearError,
    setAudioLevels 
  } = useAppStore();
  
  const { hasPermission, requestPermission } = usePermissions();
  const { 
    startRecording, 
    stopRecording, 
    cancelRecording, 
    audioLevels,
    isRecording 
  } = useAudioRecording();

  const canRecord = hasPermission && currentState !== 'processing';
  const disabled = !hasPermission || currentState === 'processing';

  // Sync audio levels with app store
  useEffect(() => {
    setAudioLevels(audioLevels);
  }, [audioLevels, setAudioLevels]);

  const handlePress = useCallback(async () => {
    try {
      // Clear any existing errors
      clearError();

      // Check permissions first
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          setError({
            type: 'permission',
            message: 'Microphone permission is required to use voice features',
            timestamp: Date.now(),
          });
          return;
        }
      }

      // Handle state transitions
      switch (currentState) {
        case 'idle':
          // Start listening and recording
          console.log('MicButton: Starting recording...');
          setCurrentState('listening');
          const recordingStarted = await startRecording();
          
          console.log('MicButton: Recording started result:', recordingStarted);
          
          if (!recordingStarted) {
            // Failed to start recording, return to idle
            console.log('MicButton: Failed to start recording, returning to idle');
            setCurrentState('idle');
            return;
          }
          
          console.log('Started listening and recording...');
          break;

        case 'listening':
          // Stop listening and start processing
          setCurrentState('processing');
          console.log('Stopped listening, processing...');
          
          const audioBuffer = await stopRecording();
          
          if (audioBuffer) {
            console.log('Audio recorded successfully, size:', audioBuffer.byteLength);
            
            // TODO: In the next tasks, this will be sent to the backend for processing
            // For now, simulate processing completion
            setTimeout(() => {
              setCurrentState('idle');
              console.log('Processing complete, returned to idle');
            }, 2000);
          } else {
            // Failed to get audio, return to idle
            setCurrentState('idle');
            setError({
              type: 'audio',
              message: 'Failed to record audio',
              timestamp: Date.now(),
            });
          }
          break;

        case 'processing':
          // Cannot interrupt processing, but allow cancellation
          console.log('Processing in progress, cancelling...');
          await cancelRecording();
          setCurrentState('idle');
          break;

        default:
          console.warn('Unknown state:', currentState);
      }
    } catch (error) {
      console.error('Error handling mic button press:', error);
      setError({
        type: 'audio',
        message: 'Failed to handle microphone interaction',
        timestamp: Date.now(),
      });
      setCurrentState('idle');
    }
  }, [
    currentState,
    hasPermission,
    setCurrentState,
    setError,
    clearError,
    requestPermission,
    startRecording,
    stopRecording,
    cancelRecording,
  ]);

  return {
    state: currentState,
    disabled,
    onPress: handlePress,
    canRecord,
  };
};