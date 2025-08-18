import React, { useEffect, useRef, useMemo } from 'react';
import { StyleSheet, Dimensions, Animated } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { WaveformVisualizerProps } from '../types/components';
import { useTheme } from './ThemeProvider';

const { width: screenWidth } = Dimensions.get('window');
const WAVEFORM_WIDTH = Math.min(screenWidth * 0.8, 300);
const WAVEFORM_HEIGHT = 80;
const BAR_COUNT = 40;
const BAR_WIDTH = WAVEFORM_WIDTH / BAR_COUNT;
const MAX_BAR_HEIGHT = WAVEFORM_HEIGHT * 0.8;
const MIN_BAR_HEIGHT = 4;

interface WaveformBar {
  height: number;
  animatedHeight: Animated.Value;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  audioLevels,
  isActive,
  style,
}) => {
  const { colors } = useTheme();
  const barsRef = useRef<WaveformBar[]>([]);
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Initialize bars with animated values
  useMemo(() => {
    if (barsRef.current.length === 0) {
      barsRef.current = Array.from({ length: BAR_COUNT }, () => ({
        height: MIN_BAR_HEIGHT,
        animatedHeight: new Animated.Value(MIN_BAR_HEIGHT),
      }));
    }
  }, []);

  // Animate visibility based on active state
  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: isActive ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isActive, opacityAnim]);

  // Update waveform bars based on audio levels
  useEffect(() => {
    if (!isActive || !audioLevels.length) {
      // When not active, animate to baseline
      barsRef.current.forEach((bar, index) => {
        const baselineHeight = MIN_BAR_HEIGHT + Math.random() * 8; // Small random baseline
        
        Animated.timing(bar.animatedHeight, {
          toValue: baselineHeight,
          duration: 200,
          useNativeDriver: false,
        }).start();
        
        bar.height = baselineHeight;
      });
      return;
    }

    // Process audio levels and update bars
    const processedLevels = processAudioLevels(audioLevels);
    
    barsRef.current.forEach((bar, index) => {
      const levelIndex = Math.floor((index / BAR_COUNT) * processedLevels.length);
      const level = processedLevels[levelIndex] || 0;
      
      // Apply exponential decay filtering for smooth transitions
      const smoothedLevel = applyExponentialDecay(level, bar.height);
      
      // Convert level to bar height
      const targetHeight = Math.max(
        MIN_BAR_HEIGHT,
        Math.min(MAX_BAR_HEIGHT, smoothedLevel * MAX_BAR_HEIGHT)
      );

      // Animate to new height
      Animated.timing(bar.animatedHeight, {
        toValue: targetHeight,
        duration: 100, // Fast response for real-time feel
        useNativeDriver: false,
      }).start();

      bar.height = targetHeight;
    });
  }, [audioLevels, isActive]);

  // Generate SVG path for waveform
  const generateWaveformPath = (): string => {
    if (!barsRef.current.length) return '';

    let path = '';
    const centerY = WAVEFORM_HEIGHT / 2;

    barsRef.current.forEach((bar, index) => {
      const x = index * BAR_WIDTH + BAR_WIDTH / 2;
      const halfHeight = bar.height / 2;
      
      // Create symmetric bars above and below center
      const topY = centerY - halfHeight;
      const bottomY = centerY + halfHeight;

      if (index === 0) {
        path += `M ${x} ${topY}`;
      } else {
        path += ` L ${x} ${topY}`;
      }
    });

    // Complete the path by going back along the bottom
    for (let i = barsRef.current.length - 1; i >= 0; i--) {
      const x = i * BAR_WIDTH + BAR_WIDTH / 2;
      const halfHeight = barsRef.current[i].height / 2;
      const bottomY = centerY + halfHeight;
      path += ` L ${x} ${bottomY}`;
    }

    path += ' Z'; // Close the path
    return path;
  };

  // Generate individual bars for better performance
  const renderBars = () => {
    return barsRef.current.map((bar, index) => {
      const x = index * BAR_WIDTH;
      const centerY = WAVEFORM_HEIGHT / 2;
      
      return (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              left: x,
              width: BAR_WIDTH - 1, // Small gap between bars
              height: bar.animatedHeight,
              backgroundColor: getBarColor(index),
              transform: [
                {
                  translateY: bar.animatedHeight.interpolate({
                    inputRange: [MIN_BAR_HEIGHT, MAX_BAR_HEIGHT],
                    outputRange: [centerY - MIN_BAR_HEIGHT / 2, centerY - MAX_BAR_HEIGHT / 2],
                  }),
                },
              ],
            },
          ]}
        />
      );
    });
  };

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

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [
            {
              scale: opacityAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        },
        style,
      ]}
    >
      <Svg
        width={WAVEFORM_WIDTH}
        height={WAVEFORM_HEIGHT}
        style={styles.svg}
      >
        <Defs>
          <LinearGradient id="waveformGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#4a90e2" stopOpacity="0.8" />
            <Stop offset="50%" stopColor="#6a5acd" stopOpacity="0.9" />
            <Stop offset="100%" stopColor="#6a5acd" stopOpacity="0.6" />
          </LinearGradient>
        </Defs>
        
        <Path
          d={generateWaveformPath()}
          fill="url(#waveformGradient)"
          stroke={isActive ? '#4a90e2' : colors.tertiary}
          strokeWidth="1"
          opacity={isActive ? 1 : 0.3}
        />
      </Svg>
      
      {/* Fallback bars for better performance on some devices */}
      {/* {renderBars()} */}
    </Animated.View>
  );
};

// Process audio levels for visualization
const processAudioLevels = (levels: number[]): number[] => {
  if (!levels.length) return [];

  // Take the most recent levels and pad if necessary
  const recentLevels = levels.slice(-BAR_COUNT);
  const processedLevels = [...recentLevels];

  // Pad with zeros if we don't have enough levels
  while (processedLevels.length < BAR_COUNT) {
    processedLevels.unshift(0);
  }

  // Apply smoothing to reduce jitter
  return processedLevels.map((level, index) => {
    if (index === 0) return level;
    
    const prevLevel = processedLevels[index - 1];
    const smoothingFactor = 0.3;
    return prevLevel * smoothingFactor + level * (1 - smoothingFactor);
  });
};

// Apply exponential decay filtering for smooth transitions
const applyExponentialDecay = (newLevel: number, currentLevel: number): number => {
  const decayFactor = 0.7; // Adjust for responsiveness vs smoothness
  
  if (newLevel > currentLevel) {
    // Quick rise for new peaks
    return newLevel * 0.8 + currentLevel * 0.2;
  } else {
    // Slower decay for natural feel
    return newLevel * 0.3 + currentLevel * decayFactor;
  }
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: WAVEFORM_WIDTH,
    height: WAVEFORM_HEIGHT,
  },
  svg: {
    backgroundColor: 'transparent',
  },
  bar: {
    position: 'absolute',
    borderRadius: 1,
    minHeight: MIN_BAR_HEIGHT,
  },
});