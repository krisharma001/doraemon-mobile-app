import { useState, useEffect, useCallback } from 'react';
import { PermissionManager } from '../services/PermissionManager';
import { useAppStore } from '../stores';

interface UsePermissionsReturn {
  hasPermission: boolean;
  isLoading: boolean;
  requestPermission: () => Promise<boolean>;
  checkPermission: () => Promise<void>;
  openSettings: () => void;
  permissionStatus: string;
}

export const usePermissions = (): UsePermissionsReturn => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState('unknown');
  
  const { setPermissions, setError } = useAppStore();
  const permissionManager = PermissionManager.getInstance();

  const checkPermission = useCallback(async () => {
    try {
      setIsLoading(true);
      const granted = await permissionManager.checkMicrophonePermission();
      const status = await permissionManager.getPermissionStatusString();
      
      setHasPermission(granted);
      setPermissions(granted);
      setPermissionStatus(status);
      
      if (!granted) {
        setError({
          type: 'permission',
          message: 'Microphone permission is required for voice interaction',
          timestamp: Date.now(),
        });
      } else {
        // Clear permission errors when permission is granted
        setError(undefined);
      }
    } catch (error) {
      console.error('Error checking permission:', error);
      setHasPermission(false);
      setPermissions(false);
      setPermissionStatus('error');
      setError({
        type: 'permission',
        message: 'Failed to check microphone permission',
        timestamp: Date.now(),
      });
    } finally {
      setIsLoading(false);
    }
  }, [setPermissions, setError, permissionManager]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const granted = await permissionManager.handlePermissionRequest();
      
      setHasPermission(granted);
      setPermissions(granted);
      
      if (granted) {
        // Initialize audio mode when permission is granted
        await permissionManager.initializeAudioMode();
        setError(undefined);
      } else {
        setError({
          type: 'permission',
          message: 'Microphone permission denied',
          timestamp: Date.now(),
        });
      }
      
      // Update status after request
      const status = await permissionManager.getPermissionStatusString();
      setPermissionStatus(status);
      
      return granted;
    } catch (error) {
      console.error('Error requesting permission:', error);
      setHasPermission(false);
      setPermissions(false);
      setError({
        type: 'permission',
        message: 'Failed to request microphone permission',
        timestamp: Date.now(),
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setPermissions, setError, permissionManager]);

  const openSettings = useCallback(() => {
    permissionManager.openAppSettings();
  }, [permissionManager]);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    hasPermission,
    isLoading,
    requestPermission,
    checkPermission,
    openSettings,
    permissionStatus,
  };
};