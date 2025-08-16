import { 
  getContrastColors, 
  getGradientTheme, 
  isValidTheme, 
  getThemeColors,
  GRADIENT_THEMES,
  CONTRAST_RATIOS 
} from '../themeUtils';

describe('themeUtils', () => {
  describe('getContrastColors', () => {
    it('should return correct colors for dark theme', () => {
      const colors = getContrastColors('dark');
      
      expect(colors.primary).toBe('#ffffff');
      expect(colors.secondary).toBe('#b0b0b0');
      expect(colors.tertiary).toBe('#808080');
    });

    it('should return correct colors for light theme', () => {
      const colors = getContrastColors('light');
      
      expect(colors.primary).toBe('#1a1a2e');
      expect(colors.secondary).toBe('#4a4a4a');
      expect(colors.tertiary).toBe('#666666');
    });
  });

  describe('getGradientTheme', () => {
    it('should return correct gradient for dark theme', () => {
      const gradient = getGradientTheme('dark');
      
      expect(gradient.colors).toEqual(['#6a5acd', '#1a1a2e']);
      expect(gradient.locations).toEqual([0, 1]);
    });

    it('should return correct gradient for light theme', () => {
      const gradient = getGradientTheme('light');
      
      expect(gradient.colors).toEqual(['#e6e6fa', '#f0f8ff']);
      expect(gradient.locations).toEqual([0, 1]);
    });
  });

  describe('isValidTheme', () => {
    it('should validate correct theme values', () => {
      expect(isValidTheme('dark')).toBe(true);
      expect(isValidTheme('light')).toBe(true);
    });

    it('should reject invalid theme values', () => {
      expect(isValidTheme('invalid')).toBe(false);
      expect(isValidTheme('')).toBe(false);
      expect(isValidTheme('Dark')).toBe(false);
      expect(isValidTheme('LIGHT')).toBe(false);
    });
  });

  describe('getThemeColors', () => {
    it('should return comprehensive color palette for dark theme', () => {
      const colors = getThemeColors('dark');
      
      expect(colors.primary).toBe('#ffffff');
      expect(colors.secondary).toBe('#b0b0b0');
      expect(colors.tertiary).toBe('#808080');
      expect(colors.gradient).toEqual(['#6a5acd', '#1a1a2e']);
      expect(colors.background).toBe('#1a1a2e');
      expect(colors.surface).toBe('#2a2a3e');
      expect(colors.border).toBe('#404040');
      expect(colors.success).toBe('#4caf50');
      expect(colors.warning).toBe('#ff9800');
      expect(colors.error).toBe('#f44336');
      expect(colors.info).toBe('#2196f3');
    });

    it('should return comprehensive color palette for light theme', () => {
      const colors = getThemeColors('light');
      
      expect(colors.primary).toBe('#1a1a2e');
      expect(colors.secondary).toBe('#4a4a4a');
      expect(colors.tertiary).toBe('#666666');
      expect(colors.gradient).toEqual(['#e6e6fa', '#f0f8ff']);
      expect(colors.background).toBe('#f0f8ff');
      expect(colors.surface).toBe('#f5f5f5');
      expect(colors.border).toBe('#e0e0e0');
      expect(colors.success).toBe('#2e7d32');
      expect(colors.warning).toBe('#f57c00');
      expect(colors.error).toBe('#d32f2f');
      expect(colors.info).toBe('#1976d2');
    });
  });

  describe('Constants', () => {
    it('should have correct gradient themes structure', () => {
      expect(GRADIENT_THEMES.dark.colors).toHaveLength(2);
      expect(GRADIENT_THEMES.light.colors).toHaveLength(2);
      expect(GRADIENT_THEMES.dark.locations).toEqual([0, 1]);
      expect(GRADIENT_THEMES.light.locations).toEqual([0, 1]);
    });

    it('should have correct contrast ratios structure', () => {
      expect(CONTRAST_RATIOS.dark).toHaveProperty('primary');
      expect(CONTRAST_RATIOS.dark).toHaveProperty('secondary');
      expect(CONTRAST_RATIOS.dark).toHaveProperty('tertiary');
      expect(CONTRAST_RATIOS.light).toHaveProperty('primary');
      expect(CONTRAST_RATIOS.light).toHaveProperty('secondary');
      expect(CONTRAST_RATIOS.light).toHaveProperty('tertiary');
    });
  });
});