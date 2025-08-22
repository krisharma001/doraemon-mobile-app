import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { HomeScreenProps } from '../types/components';
import { useAppStore } from '../stores';
import { GradientBackground, useTheme, PermissionStatus, MorphingMicWaveform } from '../components';
import { usePermissions, useMicButton, useAudioRecording } from '../hooks';

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { currentState, setCurrentState, settings, toggleTTS, setTheme, hasPermissions } = useAppStore();
  const { colors } = useTheme();
  const { hasPermission, requestPermission } = usePermissions();
  const micButton = useMicButton();
  const { isRecording, audioLevels, startRecording, stopRecording } = useAudioRecording();

  const handleTestStores = () => {
    // Test app state transitions
    setCurrentState(currentState === 'idle' ? 'listening' : 'idle');
    
    // Test settings toggle
    toggleTTS();
  };

  const handleToggleTheme = () => {
    setTheme(settings.theme === 'dark' ? 'light' : 'dark');
  };

  const navigateToSettings = () => {
    navigation?.navigate('Settings');
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={[styles.themeButton, { borderColor: colors.secondary }]}
            onPress={handleToggleTheme}
            accessibilityRole="button"
            accessibilityLabel="Toggle theme"
          >
            <Text style={[styles.settingsButtonText, { color: colors.primary }]}>
              {settings.theme === 'dark' ? '☀️' : '🌙'}
            </Text>
          </TouchableOpacity>
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
              {/* Morphing Microphone to Waveform */}
              <View style={styles.micButtonContainer}>
                <MorphingMicWaveform
                  micState={micButton.state}
                  onMicPress={micButton.onPress}
                  disabled={micButton.disabled}
                  audioLevels={audioLevels || []}
                  isRecording={isRecording}
                />
              </View>

              {/* Debug: Show recording state */}
              <View style={styles.debugContainer}>
                <Text style={[styles.debugText, { color: colors.tertiary }]}>
                  Debug: isRecording = {isRecording ? 'true' : 'false'}
                </Text>
                <Text style={[styles.debugText, { color: colors.tertiary }]}>
                  AudioLevels: {audioLevels ? audioLevels.length : 'null'}
                </Text>
              </View>

              {/* Status Information */}
              <View style={styles.statusContainer}>
                <Text style={[styles.statusText, { color: colors.primary }]}>
                  {currentState === 'idle' && 'Ready to listen'}
                  {currentState === 'listening' && 'Listening...'}
                  {currentState === 'processing' && 'Processing...'}
                  {currentState === 'responding' && 'Responding...'}
                </Text>
              </View>

              {/* Debug Info */}
              <View style={styles.storeInfo}>
                <Text style={[styles.storeText, { color: colors.secondary }]}>State: {currentState}</Text>
                <Text style={[styles.storeText, { color: colors.secondary }]}>Theme: {settings.theme}</Text>
                <Text style={[styles.storeText, { color: colors.secondary }]}>TTS: {settings.ttsEnabled ? 'ON' : 'OFF'}</Text>
                <Text style={[styles.storeText, { color: colors.secondary }]}>ASR: {settings.asrBackend}</Text>
                <Text style={[styles.storeText, { color: colors.secondary }]}>Mic: {hasPermission ? 'GRANTED' : 'DENIED'}</Text>
                <Text style={[styles.storeText, { color: colors.secondary }]}>Recording: {isRecording ? 'YES' : 'NO'}</Text>
                <Text style={[styles.storeText, { color: colors.secondary }]}>Audio Levels: {audioLevels.length}</Text>
                <Text style={[styles.storeText, { color: colors.secondary }]}>Waveform: {isRecording ? 'ACTIVE' : 'INACTIVE'}</Text>
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

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.tertiary }]}>
              {hasPermission 
                ? 'Permissions & Navigation working!' 
                : 'Grant microphone permission to continue'
              }
            </Text>
          </View>
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
    gap: 10,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeButton: {
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
  micButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 120,
  },
  waveform: {
    marginVertical: 20,
    alignItems: 'center',
  },
  debugContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  debugText: {
    fontSize: 10,
    opacity: 0.7,
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
    marginVertical: 10,
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