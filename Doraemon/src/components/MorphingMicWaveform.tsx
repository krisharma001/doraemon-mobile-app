import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Dimensions, Text, Animated } from 'react-native';
import { MicButton } from './MicButton';
import { WaveformVisualizer } from './WaveformVisualizer';
import { MicButtonState } from '../types/components';

const { width: screenWidth } = Dimensions.get('window');
const BUTTON_SIZE = Math.min(screenWidth * 0.3, 120);
const WAVEFORM_WIDTH = Math.min(screenWidth * 0.8, 300);
const WAVEFORM_HEIGHT = 80;

interface MorphingMicWaveformProps {
  micState: MicButtonState;
  onMicPress: () => void;
  disabled: boolean;
  audioLevels: number[];
  isRecording: boolean;
}

export const MorphingMicWaveform: React.FC<MorphingMicWaveformProps> = ({
  micState,
  onMicPress,
  disabled,
  audioLevels,
  isRecording,
}) => {
  // Animation values using React Native's built-in Animated API
  const micOpacity = useRef(new Animated.Value(1)).current;
  const waveformOpacity = useRef(new Animated.Value(0)).current;
  const containerScale = useRef(new Animated.Value(1)).current;
  const rippleScale = useRef(new Animated.Value(1)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;

  // Animate the morphing transition
  useEffect(() => {
    if (isRecording) {
      // Morph from mic to waveform
      Animated.parallel([
        Animated.timing(micOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(waveformOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(containerScale, {
          toValue: 1.1,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(rippleOpacity, {
            toValue: 0.3,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.parallel([
            Animated.timing(rippleScale, {
              toValue: 2,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(rippleOpacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start();
    } else {
      // Morph from waveform back to mic
      Animated.parallel([
        Animated.timing(waveformOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(micOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(containerScale, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Reset ripple
      rippleScale.setValue(1);
      rippleOpacity.setValue(0);
    }
  }, [isRecording, micOpacity, waveformOpacity, containerScale, rippleScale, rippleOpacity]);

  return (
    <View style={styles.container}>
      {/* Debug Info */}
      <Text style={styles.debugText}>
        Recording: {isRecording ? 'YES' : 'NO'} | State: {micState}
      </Text>
      
      {/* Animated Container */}
      <Animated.View 
        style={[
          styles.morphContainer,
          {
            transform: [{ scale: containerScale }],
          },
        ]}
      >
        {/* Ripple Effect */}
        <Animated.View 
          style={[
            styles.ripple,
            {
              transform: [{ scale: rippleScale }],
              opacity: rippleOpacity,
            },
          ]} 
        />
        
        {/* Microphone Button */}
        <Animated.View 
          style={[
            styles.componentContainer,
            {
              opacity: micOpacity,
              transform: [{
                scale: micOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              }],
            },
          ]}
        >
          <MicButton
            state={micState}
            onPress={onMicPress}
            disabled={disabled}
          />
        </Animated.View>

        {/* Waveform Visualizer */}
        <Animated.View 
          style={[
            styles.componentContainer,
            {
              opacity: waveformOpacity,
              transform: [{
                scale: waveformOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              }],
            },
          ]}
        >
          <WaveformVisualizer
            audioLevels={audioLevels}
            isActive={isRecording}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
    minWidth: WAVEFORM_WIDTH,
  },
  morphContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: WAVEFORM_WIDTH,
    height: WAVEFORM_HEIGHT + 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  componentContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    width: BUTTON_SIZE * 1.4,
    height: BUTTON_SIZE * 1.4,
    borderRadius: (BUTTON_SIZE * 1.4) / 2,
    backgroundColor: '#4a90e2',
    zIndex: -1,
  },
  debugText: {
    color: '#ffffff',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
    opacity: 0.7,
  },
});