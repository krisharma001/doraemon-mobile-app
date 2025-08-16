import { useCallback } from 'react';
import { useAppStore } from '../stores';
import { usePermissions } from './usePermissions';

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
    clearError 
  } = useAppStore();
  
  const { hasPermission, requestPermission } = usePermissions();

  const canRecord = hasPermission && currentState !== 'processing';
  const disabled = !hasPermission || currentState === 'processing';

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
          // Start listening
          setCurrentState('listening');
          console.log('Started listening...');
          
          // TODO: In the next task, this will start actual audio recording
          // For now, simulate a transition to processing after 3 seconds
          setTimeout(() => {
            setCurrentState('processing');
            console.log('Processing audio...');
            
            // Simulate processing completion
            setTimeout(() => {
              setCurrentState('idle');
              console.log('Returned to idle state');
            }, 2000);
          }, 3000);
          break;

        case 'listening':
          // Stop listening and start processing
          setCurrentState('processing');
          console.log('Stopped listening, processing...');
          
          // Simulate processing completion
          setTimeout(() => {
            setCurrentState('idle');
            console.log('Processing complete, returned to idle');
          }, 2000);
          break;

        case 'processing':
          // Cannot interrupt processing
          console.log('Cannot interrupt processing');
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
  ]);

  return {
    state: currentState,
    disabled,
    onPress: handlePress,
    canRecord,
  };
};