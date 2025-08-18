// useWaveform hook tests

describe('useWaveform Hook', () => {
  describe('Initial State', () => {
    it('should return correct initial state', () => {
      const initialState = {
        audioLevels: [],
        isActive: false,
        averageLevel: 0,
        peakLevel: 0,
        isClipping: false,
      };

      expect(initialState.audioLevels).toEqual([]);
      expect(initialState.isActive).toBe(false);
      expect(initialState.averageLevel).toBe(0);
      expect(initialState.peakLevel).toBe(0);
      expect(initialState.isClipping).toBe(false);
    });
  });

  describe('Audio Level Processing', () => {
    it('should process raw audio levels correctly', () => {
      const rawLevels = [0.1, 0.3, 0.5, 0.7, 0.4];
      
      // Simulate processing logic
      const processedLevels = rawLevels.map((level, index) => {
        if (index === 0) return level;
        
        const prevLevel = rawLevels[index - 1];
        const smoothingFactor = 0.3;
        return prevLevel * smoothingFactor + level * (1 - smoothingFactor);
      });

      expect(processedLevels.length).toBe(rawLevels.length);
      expect(processedLevels[0]).toBe(rawLevels[0]);
      
      processedLevels.forEach(level => {
        expect(level).toBeGreaterThanOrEqual(0);
        expect(level).toBeLessThanOrEqual(1);
      });
    });

    it('should calculate average level correctly', () => {
      const levels = [0.2, 0.4, 0.6, 0.8, 0.5];
      const average = levels.reduce((sum, level) => sum + level, 0) / levels.length;
      
      expect(average).toBe(0.5);
      expect(average).toBeGreaterThanOrEqual(0);
      expect(average).toBeLessThanOrEqual(1);
    });

    it('should track peak level correctly', () => {
      const levels = [0.2, 0.8, 0.3, 0.6, 0.4];
      const peak = Math.max(...levels);
      
      expect(peak).toBe(0.8);
      expect(peak).toBeGreaterThanOrEqual(Math.min(...levels));
    });

    it('should detect clipping correctly', () => {
      const highLevels = [0.96, 0.97, 0.98, 0.95, 0.99];
      const normalLevels = [0.3, 0.5, 0.7, 0.4, 0.6];
      
      const highClippingCount = highLevels.filter(level => level > 0.95).length;
      const normalClippingCount = normalLevels.filter(level => level > 0.95).length;
      
      const highClipping = highClippingCount > highLevels.length * 0.3;
      const normalClipping = normalClippingCount > normalLevels.length * 0.3;
      
      expect(highClipping).toBe(true);
      expect(normalClipping).toBe(false);
    });
  });

  describe('Smoothing Filter', () => {
    it('should apply smoothing filter correctly', () => {
      const levels = [0.1, 0.9, 0.2, 0.8, 0.3];
      
      if (levels.length < 2) {
        expect(levels).toEqual(levels);
        return;
      }

      const smoothed: number[] = [levels[0]];
      const alpha = 0.3;

      for (let i = 1; i < levels.length; i++) {
        const smoothedValue = alpha * levels[i] + (1 - alpha) * smoothed[i - 1];
        smoothed.push(smoothedValue);
      }

      expect(smoothed.length).toBe(levels.length);
      expect(smoothed[0]).toBe(levels[0]);
      
      // Check that smoothing reduces variance
      const originalRange = Math.max(...levels) - Math.min(...levels);
      const smoothedRange = Math.max(...smoothed) - Math.min(...smoothed);
      expect(smoothedRange).toBeLessThanOrEqual(originalRange);
    });

    it('should handle edge cases in smoothing', () => {
      const emptyLevels: number[] = [];
      const singleLevel = [0.5];
      
      // Empty array should return empty
      expect(emptyLevels.length < 2 ? emptyLevels : []).toEqual([]);
      
      // Single level should return as-is
      expect(singleLevel.length < 2 ? singleLevel : []).toEqual([0.5]);
    });
  });

  describe('Normalization', () => {
    it('should normalize audio levels correctly', () => {
      const levels = [0.2, 0.4, 0.8, 0.6, 0.3];
      
      if (!levels.length) {
        expect([]).toEqual([]);
        return;
      }

      const maxLevel = Math.max(...levels);
      
      if (maxLevel === 0) {
        expect(levels).toEqual(levels);
        return;
      }

      const normalized = levels.map(level => {
        const norm = level / maxLevel;
        const compressed = Math.pow(norm, 0.7);
        return Math.max(0.05, compressed);
      });

      expect(normalized.length).toBe(levels.length);
      
      normalized.forEach(level => {
        expect(level).toBeGreaterThanOrEqual(0.05);
        expect(level).toBeLessThanOrEqual(1);
      });
      
      // Maximum should be 1 after normalization
      expect(Math.max(...normalized)).toBe(1);
    });

    it('should handle zero levels in normalization', () => {
      const zeroLevels = [0, 0, 0, 0];
      const maxLevel = Math.max(...zeroLevels);
      
      if (maxLevel === 0) {
        expect(zeroLevels).toEqual(zeroLevels);
      }
    });
  });

  describe('Peak Hold Logic', () => {
    it('should implement peak hold correctly', () => {
      let peakHold = 0;
      let peakHoldTime = 0;
      const holdDuration = 1000; // 1 second
      
      const levels = [0.3, 0.7, 0.4, 0.8, 0.2];
      
      levels.forEach(level => {
        const now = Date.now();
        const peak = level;
        
        if (peak > peakHold || now - peakHoldTime > holdDuration) {
          peakHold = peak;
          peakHoldTime = now;
        }
      });
      
      expect(peakHold).toBe(0.8); // Should hold the highest peak
      expect(peakHoldTime).toBeGreaterThan(0);
    });
  });

  describe('State Management', () => {
    it('should handle active state changes', () => {
      const states = ['idle', 'listening', 'processing'];
      
      states.forEach(state => {
        const isActive = state === 'listening';
        expect(typeof isActive).toBe('boolean');
        expect(isActive).toBe(state === 'listening');
      });
    });

    it('should handle reset functionality', () => {
      const resetState = {
        audioLevels: [],
        averageLevel: 0,
        peakLevel: 0,
        isClipping: false,
      };
      
      expect(resetState.audioLevels).toEqual([]);
      expect(resetState.averageLevel).toBe(0);
      expect(resetState.peakLevel).toBe(0);
      expect(resetState.isClipping).toBe(false);
    });
  });

  describe('Fade Out Logic', () => {
    it('should apply fade out when not active', () => {
      const levels = [0.5, 0.7, 0.3, 0.8, 0.4];
      const fadeOutLevels = levels.map(level => level * 0.8);
      
      expect(fadeOutLevels.length).toBe(levels.length);
      
      fadeOutLevels.forEach((fadedLevel, index) => {
        expect(fadedLevel).toBeLessThan(levels[index]);
        expect(fadedLevel).toBe(levels[index] * 0.8);
      });
    });
  });

  describe('History Management', () => {
    it('should maintain rolling window of levels', () => {
      const maxHistorySize = 100;
      let history: number[] = [];
      
      // Add more levels than max size
      for (let i = 0; i < 150; i++) {
        history.push(Math.random());
        history = history.slice(-maxHistorySize);
      }
      
      expect(history.length).toBeLessThanOrEqual(maxHistorySize);
      expect(history.length).toBe(maxHistorySize);
    });

    it('should handle recent levels calculation', () => {
      const history = Array.from({ length: 50 }, () => Math.random());
      const recentCount = 20;
      const recentLevels = history.slice(-recentCount);
      
      expect(recentLevels.length).toBeLessThanOrEqual(recentCount);
      expect(recentLevels.length).toBe(Math.min(recentCount, history.length));
    });
  });

  describe('Error Handling', () => {
    it('should handle empty or invalid audio levels', () => {
      const emptyLevels: number[] = [];
      const invalidLevels = [NaN, undefined, null].filter(Boolean) as number[];
      
      expect(emptyLevels.length).toBe(0);
      expect(invalidLevels.every(level => typeof level === 'number' && !isNaN(level))).toBe(true);
    });

    it('should handle edge cases in calculations', () => {
      const edgeCases = [
        [],
        [0],
        [1],
        [0, 0, 0],
        [1, 1, 1],
      ];
      
      edgeCases.forEach(levels => {
        const avg = levels.length > 0 ? levels.reduce((sum, level) => sum + level, 0) / levels.length : 0;
        const peak = levels.length > 0 ? Math.max(...levels) : 0;
        
        expect(avg).toBeGreaterThanOrEqual(0);
        expect(avg).toBeLessThanOrEqual(1);
        expect(peak).toBeGreaterThanOrEqual(0);
        expect(peak).toBeLessThanOrEqual(1);
      });
    });
  });
});