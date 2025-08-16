import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackgroundProps } from '../types/components';
import { useSettingsStore } from '../stores';
import { getGradientTheme } from '../utils/themeUtils';

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  colors,
}) => {
  const { settings } = useSettingsStore();
  const theme = settings.theme;
  
  // Use custom colors if provided, otherwise use theme-based colors
  const gradientConfig = colors 
    ? { colors: colors as unknown as readonly [string, string, ...string[]], locations: [0, 1] as const }
    : getGradientTheme(theme);

  return (
    <LinearGradient
      colors={gradientConfig.colors}
      locations={gradientConfig.locations}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
};

// Re-export utility functions for convenience
export { getContrastColors, getGradientTheme, getThemeColors } from '../utils/themeUtils';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});