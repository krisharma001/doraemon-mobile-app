import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SettingsScreenProps } from '../types/components';
import { useSettingsStore } from '../stores';
import { GradientBackground, useTheme, ThemeToggle } from '../components';

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { 
    settings, 
    setTTSEnabled, 
    setASRBackend, 
    setPrivacyMode,
    resetSettings,
    exportSettings 
  } = useSettingsStore();
  const { colors } = useTheme();

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleASRBackendChange = () => {
    const backends: Array<typeof settings.asrBackend> = ['default', 'whisper', 'google'];
    const currentIndex = backends.indexOf(settings.asrBackend);
    const nextIndex = (currentIndex + 1) % backends.length;
    setASRBackend(backends[nextIndex]);
  };

  const handleResetSettings = () => {
    resetSettings();
  };

  const handleExportSettings = () => {
    const exported = exportSettings();
    console.log('Exported settings:', exported);
    // In a real app, this would show a share dialog or save to file
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={[styles.backButton, { borderColor: colors.secondary }]}
            onPress={handleBackPress}
            accessibilityRole="button"
            accessibilityLabel="Go back to home screen"
          >
            <Text style={[styles.backButtonText, { color: colors.primary }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Appearance</Text>
            
            <View style={styles.settingItem}>
              <Text style={[styles.settingLabel, { color: colors.secondary }]}>Theme</Text>
              <ThemeToggle />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Voice Settings</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.secondary }]}>Text-to-Speech</Text>
                <Text style={[styles.settingDescription, { color: colors.tertiary }]}>
                  Enable voice responses from Doraemon
                </Text>
              </View>
              <Switch
                value={settings.ttsEnabled}
                onValueChange={setTTSEnabled}
                trackColor={{ false: colors.tertiary, true: '#4a90e2' }}
                thumbColor={settings.ttsEnabled ? '#ffffff' : '#f4f3f4'}
              />
            </View>

            <TouchableOpacity 
              style={styles.settingItem}
              onPress={handleASRBackendChange}
              accessibilityRole="button"
              accessibilityLabel={`Change ASR backend, currently ${settings.asrBackend}`}
            >
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.secondary }]}>Speech Recognition</Text>
                <Text style={[styles.settingDescription, { color: colors.tertiary }]}>
                  Choose the speech recognition engine
                </Text>
              </View>
              <Text style={[styles.settingValue, { color: colors.primary }]}>
                {settings.asrBackend.toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Privacy</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.secondary }]}>Privacy Mode</Text>
                <Text style={[styles.settingDescription, { color: colors.tertiary }]}>
                  Enhanced privacy protection for conversations
                </Text>
              </View>
              <Switch
                value={settings.privacyMode}
                onValueChange={setPrivacyMode}
                trackColor={{ false: colors.tertiary, true: '#4a90e2' }}
                thumbColor={settings.privacyMode ? '#ffffff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.privacyInfo}>
              <Text style={[styles.privacyText, { color: colors.tertiary }]}>
                When privacy mode is enabled, conversations are not stored locally and 
                additional encryption is used for network communications.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Data Management</Text>
            
            <TouchableOpacity 
              style={[styles.actionButton, { borderColor: colors.secondary }]}
              onPress={handleExportSettings}
              accessibilityRole="button"
              accessibilityLabel="Export settings"
            >
              <Text style={[styles.actionButtonText, { color: colors.primary }]}>Export Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.dangerButton]}
              onPress={handleResetSettings}
              accessibilityRole="button"
              accessibilityLabel="Reset all settings to default"
            >
              <Text style={[styles.actionButtonText, styles.dangerButtonText]}>Reset to Defaults</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.tertiary }]}>
              Doraemon AI Assistant v1.0.0
            </Text>
            <Text style={[styles.footerText, { color: colors.tertiary }]}>
              Settings are automatically saved
            </Text>
          </View>
        </ScrollView>
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  privacyInfo: {
    marginTop: 12,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  privacyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    borderColor: '#f44336',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  dangerButtonText: {
    color: '#f44336',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
});