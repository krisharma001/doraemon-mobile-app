import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore, useMessageStore, useSettingsStore } from './src/stores';

export default function App() {
  const { currentState, setCurrentState } = useAppStore();
  const { addMessage, getMessageCount } = useMessageStore();
  const { settings, setTTSEnabled } = useSettingsStore();

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
    <LinearGradient
      colors={['#6a5acd', '#1a1a2e']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Doraemon</Text>
        <Text style={styles.subtitle}>AI Assistant</Text>
        <Text style={styles.version}>v1.0.0</Text>
        
        <View style={styles.storeInfo}>
          <Text style={styles.storeText}>State: {currentState}</Text>
          <Text style={styles.storeText}>Messages: {getMessageCount()}</Text>
          <Text style={styles.storeText}>TTS: {settings.ttsEnabled ? 'ON' : 'OFF'}</Text>
        </View>
        
        <TouchableOpacity style={styles.testButton} onPress={handleTestStores}>
          <Text style={styles.testButtonText}>Test Stores</Text>
        </TouchableOpacity>
        
        <StatusBar style="light" />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#b0b0b0',
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: '#808080',
    marginBottom: 32,
  },
  storeInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  storeText: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 4,
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
});
