import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from './ThemeProvider';

interface ThemeToggleProps {
  style?: any;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ style }) => {
  const { theme, colors, setTheme } = useTheme();

  const handleToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <TouchableOpacity
      style={[styles.container, { borderColor: colors.secondary }, style]}
      onPress={handleToggle}
      accessibilityRole="button"
      accessibilityLabel={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      accessibilityHint="Toggles between dark and light theme"
    >
      <Text style={[styles.text, { color: colors.primary }]}>
        {theme === 'dark' ? '🌙' : '☀️'} {theme.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});