import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { HomeScreenProps } from '../types/components';
import { useAppStore, useMessageStore, useSettingsStore } from '../stores';
import { GradientBackground, useTheme, PermissionStatus, MicButton } from '../components';
import { usePermissions, useMicButton } from '../hooks';

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { currentState, setCurrentState, hasPermissions } = useAppStore();
  const { addMessage, getMessageCount } = useMessageStore();
  const { settings, setTTSEnabled } = useSettingsStore();
  const { colors } = useTheme();
  const { hasPermission } = usePermissions();
  const micButton = useMicButton();

  const handleTestStores = () => {
    // Test app state
    setCurrentState(currentState === 'idle' ? 'listening' : 'idle');
    
    // Test message store
    addMessage({
      role: 'user',
      text: `Test message ${getMessageCount() + 1}`,
    });
    
    // Test settings store
    setTTSEnabled(!settings.ttsEnabled);
  };

  const navigateToSettings = () => {
    navigation.navigate('Settings');
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={[styles.settingsButton, { borderColor: colors.secondary }]}
            onPress={navigateToSettings}
            accessibilityRole="button"
            accessibilityLabel="Open settings"
          >
            <Text style={[styles.settingsButtonText, { color: colors.primary }]}>⚙️</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.primary }]}>Doraemon</Text>
          <Text style={[styles.subtitle, { color: colors.secondary }]}>AI Assistant</Text>
          <Text style={[styles.version, { color: colors.tertiary }]}>v1.0.0</Text>
          
          {!hasPermission ? (
            <PermissionStatus 
              onPermissionGranted={() => {
                console.log('Permission granted, ready for voice interaction');
              }}
            />
          ) : (
            <>
              {/* Microphone Button */}
              <View style={styles.micButtonContainer}>
                <MicButton
                  state={micButton.state}
                  onPress={micButton.onPress}
                  disabled={micButton.disabled}
                />
              </View>

              {/* Status Information */}
              <View style={styles.statusContainer}>
                <Text style={[styles.statusText, { color: colors.primary }]}>
                  {currentState === 'idle' && 'Ready to listen'}
                  {currentState === 'listening' && 'Listening...'}
                  {currentState === 'processing' && 'Processing...'}
                </Text>
              </View>

              {/* Debug Info */}
              <View style={styles.storeInfo}>
                <Text style={[styles.storeText, { color: colors.secondary }]}>State: {currentState}</Text>
                <Text style={[styles.storeText, { color: colors.secondary }]}>Messages: {getMessageCount()}</Text>
                <Text style={[styles.storeText, { color: colors.secondary }]}>TTS: {settings.ttsEnabled ? 'ON' : 'OFF'}</Text>
                <Text style={[styles.storeText, { color: colors.secondary }]}>Mic: {hasPermissions ? 'GRANTED' : 'DENIED'}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.testButton} 
                onPress={handleTestStores}
                accessibilityRole="button"
                accessibilityLabel="Test store functionality"
              >
                <Text style={styles.testButtonText}>Test Stores</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.tertiary }]}>
            {hasPermission 
              ? 'Tap the microphone to start talking' 
              : 'Grant microphone permission to continue'
            }
          </Text>
        </View>
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButtonText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    marginBottom: 20,
  },
  micButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  statusContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  storeInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  storeText: {
    fontSize: 12,
    marginBottom: 2,
    opacity: 0.7,
  },
  testButton: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  testButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
  },
});