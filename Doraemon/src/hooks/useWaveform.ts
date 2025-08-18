import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '../stores';

interface UseWaveformReturn {
  audioLevels: number[];
  isActive: boolean;
  averageLevel: number;
  peakLevel: number;
  isClipping: boolean;
  resetWaveform: () => void;
}

export const useWaveform = (): UseWaveformReturn => {
  const { audioLevels: storeAudioLevels, currentState } = useAppStore();
  const [processedLevels, setProcessedLevels] = useState<number[]>([]);
  const [averageLevel, setAverageLevel] = useState(0);
  const [peakLevel, setPeakLevel] = useState(0);
  const [isClipping, setIsClipping] = useState(false);
  
  const levelHistoryRef = useRef<number[]>([]);
  const peakHoldRef = useRef(0);
  const peakHoldTimeRef = useRef(0);

  const isActive = currentState === 'listening';

  // Process and smooth audio levels
  const processAudioLevels = useCallback((rawLevels: number[]) => {
    if (!rawLevels.length) {
      setProcessedLevels([]);
      setAverageLevel(0);
      setPeakLevel(0);
      setIsClipping(false);
      return;
    }

    // Add to history and maintain a rolling window
    levelHistoryRef.current = [...levelHistoryRef.current, ...rawLevels].slice(-100);
    
    // Calculate statistics
    const recentLevels = levelHistoryRef.current.slice(-20); // Last 20 samples
    const avg = recentLevels.reduce((sum, level) => sum + level, 0) / recentLevels.length;
    const peak = Math.max(...recentLevels);
    
    // Peak hold logic (hold peak for 1 second)
    const now = Date.now();
    if (peak > peakHoldRef.current || now - peakHoldTimeRef.current > 1000) {
      peakHoldRef.current = peak;
      peakHoldTimeRef.current = now;
    }
    
    // Detect clipping (levels consistently above 0.95)
    const highLevels = recentLevels.filter(level => level > 0.95);
    const clipping = highLevels.length > recentLevels.length * 0.3;
    
    // Apply smoothing and normalization
    const smoothedLevels = applySmoothingFilter(rawLevels);
    const normalizedLevels = normalizeAudioLevels(smoothedLevels);
    
    setProcessedLevels(normalizedLevels);
    setAverageLevel(avg);
    setPeakLevel(peakHoldRef.current);
    setIsClipping(clipping);
  }, []);

  // Update processed levels when store levels change
  useEffect(() => {
    if (isActive && storeAudioLevels.length > 0) {
      processAudioLevels(storeAudioLevels);
    } else if (!isActive) {
      // Gradually fade out when not active
      const fadeOutLevels = processedLevels.map(level => level * 0.8);
      setProcessedLevels(fadeOutLevels);
      
      // Clear after fade out
      setTimeout(() => {
        if (!isActive) {
          setProcessedLevels([]);
          setAverageLevel(0);
        }
      }, 500);
    }
  }, [storeAudioLevels, isActive, processAudioLevels, processedLevels]);

  // Reset waveform data
  const resetWaveform = useCallback(() => {
    setProcessedLevels([]);
    setAverageLevel(0);
    setPeakLevel(0);
    setIsClipping(false);
    levelHistoryRef.current = [];
    peakHoldRef.current = 0;
    peakHoldTimeRef.current = 0;
  }, []);

  // Reset when state changes to idle
  useEffect(() => {
    if (currentState === 'idle') {
      resetWaveform();
    }
  }, [currentState, resetWaveform]);

  return {
    audioLevels: processedLevels,
    isActive,
    averageLevel,
    peakLevel,
    isClipping,
    resetWaveform,
  };
};

// Apply smoothing filter to reduce jitter
const applySmoothingFilter = (levels: number[]): number[] => {
  if (levels.length < 2) return levels;

  const smoothed: number[] = [levels[0]];
  const alpha = 0.3; // Smoothing factor (0 = no smoothing, 1 = maximum smoothing)

  for (let i = 1; i < levels.length; i++) {
    const smoothedValue = alpha * levels[i] + (1 - alpha) * smoothed[i - 1];
    smoothed.push(smoothedValue);
  }

  return smoothed;
};

// Normalize audio levels for better visualization
const normalizeAudioLevels = (levels: number[]): number[] => {
  if (!levels.length) return [];

  // Find the maximum level for normalization
  const maxLevel = Math.max(...levels);
  
  if (maxLevel === 0) return levels;

  // Apply dynamic range compression
  return levels.map(level => {
    // Normalize to 0-1 range
    const normalized = level / maxLevel;
    
    // Apply gentle compression curve for better visualization
    const compressed = Math.pow(normalized, 0.7);
    
    // Ensure minimum visibility
    return Math.max(0.05, compressed);
  });
};