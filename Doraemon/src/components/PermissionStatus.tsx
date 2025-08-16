import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from './ThemeProvider';
import { usePermissions } from '../hooks/usePermissions';

interface PermissionStatusProps {
  onPermissionGranted?: () => void;
  showDetails?: boolean;
}

export const PermissionStatus: React.FC<PermissionStatusProps> = ({
  onPermissionGranted,
  showDetails = false,
}) => {
  const { colors } = useTheme();
  const { 
    hasPermission, 
    isLoading, 
    requestPermission, 
    openSettings, 
    permissionStatus 
  } = usePermissions();

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted && onPermissionGranted) {
      onPermissionGranted();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.statusText, { color: colors.secondary }]}>
          Checking microphone permission...
        </Text>
      </View>
    );
  }

  if (hasPermission) {
    return showDetails ? (
      <View style={styles.container}>
        <Text style={[styles.statusIcon, styles.successIcon]}>✓</Text>
        <Text style={[styles.statusText, { color: colors.primary }]}>
          Microphone access granted
        </Text>
        {showDetails && (
          <Text style={[styles.detailText, { color: colors.tertiary }]}>
            Status: {permissionStatus}
          </Text>
        )}
      </View>
    ) : null;
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.statusIcon, styles.errorIcon]}>⚠️</Text>
      <Text style={[styles.statusText, { color: colors.primary }]}>
        Microphone permission required
      </Text>
      <Text style={[styles.descriptionText, { color: colors.secondary }]}>
        Doraemon needs microphone access to listen to your voice commands
      </Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleRequestPermission}
          accessibilityRole="button"
          accessibilityLabel="Grant microphone permission"
        >
          <Text style={styles.primaryButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton, { borderColor: colors.secondary }]}
          onPress={openSettings}
          accessibilityRole="button"
          accessibilityLabel="Open device settings"
        >
          <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
            Open Settings
          </Text>
        </TouchableOpacity>
      </View>
      
      {showDetails && (
        <Text style={[styles.detailText, { color: colors.tertiary }]}>
          Status: {permissionStatus}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  statusIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  successIcon: {
    color: '#4caf50',
  },
  errorIcon: {
    // Uses emoji, no color needed
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4a90e2',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailText: {
    fontSize: 12,
    marginTop: 16,
    textAlign: 'center',
  },
});