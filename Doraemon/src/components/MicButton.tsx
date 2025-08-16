import React, { useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  Animated, 
  Dimensions 
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { MicButtonProps } from '../types/components';
import { useTheme } from './ThemeProvider';

const { width: screenWidth } = Dimensions.get('window');
const BUTTON_SIZE = Math.min(screenWidth * 0.3, 120);
const GLOW_SIZE = BUTTON_SIZE * 1.4;

export const MicButton: React.FC<MicButtonProps> = ({
  state,
  onPress,
  disabled = false,
}) => {
  const { colors } = useTheme();
  
  // Animation values
  const glowOpacity = useRef(new Animated.Value(0.3)).current;
  const glowScale = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const pulseAnimation = useRef<Animated.CompositeAnimation | null>(null);

  // Start glow animation based on state
  useEffect(() => {
    // Stop any existing animation
    if (pulseAnimation.current) {
      pulseAnimation.current.stop();
    }

    switch (state) {
      case 'idle':
        // Gentle breathing glow
        pulseAnimation.current = Animated.loop(
          Animated.sequence([
            Animated.timing(glowOpacity, {
              toValue: 0.6,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(glowOpacity, {
              toValue: 0.3,
              duration: 2000,
              useNativeDriver: true,
            }),
          ])
        );
        pulseAnimation.current.start();
        
        // Reset scale
        Animated.spring(glowScale, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
        break;

      case 'listening':
        // Active pulsing glow
        pulseAnimation.current = Animated.loop(
          Animated.sequence([
            Animated.timing(glowOpacity, {
              toValue: 0.9,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(glowOpacity, {
              toValue: 0.5,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        );
        pulseAnimation.current.start();
        
        // Slightly larger glow
        Animated.spring(glowScale, {
          toValue: 1.1,
          useNativeDriver: true,
        }).start();
        break;

      case 'processing':
        // Steady bright glow
        Animated.timing(glowOpacity, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }).start();
        
        // Normal scale
        Animated.spring(glowScale, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
        break;

      default:
        // Fade out glow
        Animated.timing(glowOpacity, {
          toValue: 0.1,
          duration: 300,
          useNativeDriver: true,
        }).start();
    }

    return () => {
      if (pulseAnimation.current) {
        pulseAnimation.current.stop();
      }
    };
  }, [state, glowOpacity, glowScale]);

  const handlePress = async () => {
    if (disabled) return;

    // Haptic feedback
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('Haptic feedback not available');
    }

    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  const getButtonColor = () => {
    if (disabled) return colors.tertiary;
    
    switch (state) {
      case 'idle':
        return '#6a5acd'; // Purple
      case 'listening':
        return '#4a90e2'; // Blue
      case 'processing':
        return '#ff9800'; // Orange
      default:
        return colors.tertiary;
    }
  };

  const getGlowColor = () => {
    if (disabled) return colors.tertiary;
    
    switch (state) {
      case 'idle':
        return '#6a5acd';
      case 'listening':
        return '#4a90e2';
      case 'processing':
        return '#ff9800';
      default:
        return colors.tertiary;
    }
  };

  const getMicrophoneIcon = () => {
    switch (state) {
      case 'listening':
        return '🎤';
      case 'processing':
        return '⏳';
      default:
        return '🎙️';
    }
  };

  return (
    <View style={styles.container}>
      {/* Outer glow effect */}
      <Animated.View
        style={[
          styles.glow,
          {
            opacity: glowOpacity,
            transform: [{ scale: glowScale }],
            backgroundColor: getGlowColor(),
          },
        ]}
      />
      
      {/* Main button */}
      <Animated.View
        style={[
          styles.buttonContainer,
          {
            transform: [{ scale: buttonScale }],
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: getButtonColor(),
              opacity: disabled ? 0.5 : 1,
            },
          ]}
          onPress={handlePress}
          disabled={disabled}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Microphone button, current state: ${state}`}
          accessibilityHint={
            disabled 
              ? 'Microphone is disabled' 
              : state === 'idle' 
                ? 'Tap to start recording' 
                : state === 'listening'
                  ? 'Tap to stop recording'
                  : 'Processing your request'
          }
        >
          <View style={styles.iconContainer}>
            <Animated.Text style={styles.icon}>
              {getMicrophoneIcon()}
            </Animated.Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Inner highlight */}
      <View
        style={[
          styles.highlight,
          {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          },
        ]}
        pointerEvents="none"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    borderRadius: GLOW_SIZE / 2,
    shadowColor: '#6a5acd',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonContainer: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: BUTTON_SIZE * 0.4,
    textAlign: 'center',
  },
  highlight: {
    position: 'absolute',
    width: BUTTON_SIZE * 0.6,
    height: BUTTON_SIZE * 0.3,
    borderRadius: BUTTON_SIZE * 0.3,
    top: GLOW_SIZE / 2 - BUTTON_SIZE / 2 + BUTTON_SIZE * 0.15,
  },
});