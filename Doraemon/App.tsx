import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function App() {
  return (
    <LinearGradient
      colors={['#6a5acd', '#1a1a2e']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Doraemon</Text>
        <Text style={styles.subtitle}>AI Assistant</Text>
        <Text style={styles.version}>v1.0.0</Text>
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
  },
});
