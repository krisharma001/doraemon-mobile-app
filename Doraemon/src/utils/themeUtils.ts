// Theme utility functions for Doraemon AI Assistant

// Theme-based gradient configurations
export const GRADIENT_THEMES = {
  dark: {
    colors: ['#6a5acd', '#1a1a2e'] as const, // Purple to deep blue
    locations: [0, 1] as const,
  },
  light: {
    colors: ['#e6e6fa', '#f0f8ff'] as const, // Light lavender to alice blue
    locations: [0, 1] as const,
  },
} as const;

// Accessibility contrast ratios (WCAG AA compliant)
export const CONTRAST_RATIOS = {
  dark: {
    primary: '#ffffff', // White text on dark background
    secondary: '#b0b0b0', // Light gray text
    tertiary: '#808080', // Medium gray text
  },
  light: {
    primary: '#1a1a2e', // Dark text on light background
    secondary: '#4a4a4a', // Dark gray text
    tertiary: '#666666', // Medium gray text
  },
} as const;

// Export contrast ratios for use in other components
export const getContrastColors = (theme: 'dark' | 'light') => {
  return CONTRAST_RATIOS[theme];
};

// Export gradient themes for consistency
export const getGradientTheme = (theme: 'dark' | 'light') => {
  return GRADIENT_THEMES[theme];
};

// Validate theme value
export const isValidTheme = (theme: string): theme is 'dark' | 'light' => {
  return theme === 'dark' || theme === 'light';
};

// Get theme-appropriate colors for specific UI elements
export const getThemeColors = (theme: 'dark' | 'light') => {
  const contrast = getContrastColors(theme);
  const gradient = getGradientTheme(theme);
  
  return {
    ...contrast,
    gradient: gradient.colors,
    background: gradient.colors[1], // Use the end color as solid background
    surface: theme === 'dark' ? '#2a2a3e' : '#f5f5f5',
    border: theme === 'dark' ? '#404040' : '#e0e0e0',
    success: theme === 'dark' ? '#4caf50' : '#2e7d32',
    warning: theme === 'dark' ? '#ff9800' : '#f57c00',
    error: theme === 'dark' ? '#f44336' : '#d32f2f',
    info: theme === 'dark' ? '#2196f3' : '#1976d2',
  };
};