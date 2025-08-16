import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useAppStore, useMessageStore, useSettingsStore } from './src/stores';
import { GradientBackground, ThemeProvider, ThemeToggle, useTheme } from './src/components';

function AppContent() {
  const { currentState, setCurrentState } = useAppStore();
  const { addMessage, getMessageCount } = useMessageStore();
  const { settings, setTTSEnabled } = useSettingsStore();
  const { colors } = useTheme();

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

  return (
    <GradientBackground>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.primary }]}>Doraemon</Text>
        <Text style={[styles.subtitle, { color: colors.secondary }]}>AI Assistant</Text>
        <Text style={[styles.version, { color: colors.tertiary }]}>v1.0.0</Text>
        
        <View style={styles.storeInfo}>
          <Text style={[styles.storeText, { color: colors.primary }]}>State: {currentState}</Text>
          <Text style={[styles.storeText, { color: colors.primary }]}>Messages: {getMessageCount()}</Text>
          <Text style={[styles.storeText, { color: colors.primary }]}>TTS: {settings.ttsEnabled ? 'ON' : 'OFF'}</Text>
          <Text style={[styles.storeText, { color: colors.primary }]}>Theme: {settings.theme.toUpperCase()}</Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.testButton} onPress={handleTestStores}>
            <Text style={styles.testButtonText}>Test Stores</Text>
          </TouchableOpacity>
          
          <ThemeToggle style={styles.themeToggle} />
        </View>
      </View>
    </GradientBackground>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
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
    marginBottom: 32,
  },
  storeInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  storeText: {
    fontSize: 16,
    marginBottom: 4,
  },
  buttonContainer: {
    alignItems: 'center',
    gap: 16,
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
  themeToggle: {
    marginTop: 8,
  },
});
