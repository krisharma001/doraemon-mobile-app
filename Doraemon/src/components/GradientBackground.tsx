import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackgroundProps } from '../types/components';
import { useAppStore } from '../stores';

// Theme-aware gradient colors
const getGradientColors = (theme: 'dark' | 'light') => {
  if (theme === 'dark') {
    return {
      colors: ['#6a5acd', '#1a1a2e'] as const,
      locations: [0, 1] as const,
    };
  } else {
    return {
      colors: ['#f0f8ff', '#e6e6fa'] as const, // Light blue to lavender
      locations: [0, 1] as const,
    };
  }
};

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  colors,
}) => {
  const { settings } = useAppStore();
  const theme = settings.theme;
  
  // Use custom colors if provided, otherwise use theme-based colors
  const gradientConfig = colors 
    ? { colors: colors as unknown as readonly [string, string, ...string[]], locations: [0, 1] as const }
    : getGradientColors(theme);

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

// Simple utility functions for theme colors
export const getContrastColors = (theme: 'dark' | 'light') => {
  if (theme === 'dark') {
    return {
      primary: '#ffffff',
      secondary: '#b0b0b0',
      tertiary: '#808080',
    };
  } else {
    return {
      primary: '#000000',
      secondary: '#404040',
      tertiary: '#606060',
    };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});