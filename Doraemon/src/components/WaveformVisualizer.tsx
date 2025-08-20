import React, { useEffect, useRef } from 'react';
import { StyleSheet, Dimensions, View, Text } from 'react-native';
import { WaveformVisualizerProps } from '../types/components';
import { useTheme } from './ThemeProvider';

const { width: screenWidth } = Dimensions.get('window');
const WAVEFORM_WIDTH = Math.min(screenWidth * 0.8, 300);
const WAVEFORM_HEIGHT = 80;
const BAR_COUNT = 15; // Reduced for better performance
const BAR_WIDTH = WAVEFORM_WIDTH / BAR_COUNT;
const MAX_BAR_HEIGHT = WAVEFORM_HEIGHT * 0.8;
const MIN_BAR_HEIGHT = 8;

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  audioLevels,
  isActive,
  style,
}) => {
  const { colors } = useTheme();
  const barsRef = useRef<number[]>(Array(BAR_COUNT).fill(MIN_BAR_HEIGHT));

  // Update bars based on audio levels
  useEffect(() => {
    if (!isActive || !audioLevels || !audioLevels.length) {
      // When not active, set to baseline
      barsRef.current = Array(BAR_COUNT).fill(MIN_BAR_HEIGHT);
      return;
    }

    // Process audio levels and update bars
    const processedLevels = processAudioLevels(audioLevels);
    
    barsRef.current = processedLevels.map((level, index) => {
      // Convert level to bar height with some randomness for visual appeal
      const targetHeight = Math.max(
        MIN_BAR_HEIGHT,
        Math.min(MAX_BAR_HEIGHT, level * MAX_BAR_HEIGHT + Math.random() * 12)
      );
      return targetHeight;
    });
  }, [audioLevels, isActive]);

  // Get color for individual bars with gradient effect
  const getBarColor = (index: number): string => {
    const progress = index / (BAR_COUNT - 1);
    
    if (isActive) {
      // Active state: blue to purple gradient
      const r = Math.round(74 + (106 - 74) * progress); // 74 -> 106
      const g = Math.round(144 + (90 - 144) * progress); // 144 -> 90
      const b = Math.round(226 + (205 - 226) * progress); // 226 -> 205
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // Inactive state: subtle gray
      return colors.tertiary;
    }
  };

  if (!isActive) {
    return (
      <View style={[styles.container, style]}>
        <Text style={[styles.inactiveText, { color: colors.tertiary }]}>
          Waveform inactive
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.activeText, { color: colors.primary }]}>
        🎵 Recording Audio 🎵
      </Text>
      <View style={styles.barsContainer}>
        {barsRef.current.map((height, index) => (
          <View
            key={index}
            style={[
              styles.bar,
              {
                width: BAR_WIDTH - 2,
                height: height,
                backgroundColor: getBarColor(index),
              },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.debugText, { color: colors.secondary }]}>
        Levels: {audioLevels?.length || 0} | Active: {isActive ? 'YES' : 'NO'}
      </Text>
    </View>
  );
};

// Process audio levels for visualization
const processAudioLevels = (levels: number[]): number[] => {
  if (!levels || !levels.length) return Array(BAR_COUNT).fill(0);

  // Take the most recent levels and pad if necessary
  const recentLevels = levels.slice(-BAR_COUNT);
  const processedLevels = [...recentLevels];

  // Pad with zeros if we don't have enough levels
  while (processedLevels.length < BAR_COUNT) {
    processedLevels.unshift(0);
  }

  // Apply smoothing to reduce jitter
  return processedLevels.map((level, index) => {
    if (index === 0) return Math.max(0, Math.min(1, level));
    
    const prevLevel = processedLevels[index - 1];
    const smoothingFactor = 0.3;
    const smoothedLevel = prevLevel * smoothingFactor + level * (1 - smoothingFactor);
    return Math.max(0, Math.min(1, smoothedLevel));
  });
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: WAVEFORM_WIDTH,
    height: WAVEFORM_HEIGHT,
    padding: 10,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: MAX_BAR_HEIGHT,
    marginVertical: 10,
  },
  bar: {
    borderRadius: 2,
    minHeight: MIN_BAR_HEIGHT,
    marginHorizontal: 1,
  },
  activeText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  inactiveText: {
    fontSize: 12,
    opacity: 0.7,
  },
  debugText: {
    fontSize: 10,
    opacity: 0.7,
    marginTop: 5,
  },
});