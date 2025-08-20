import React, { createContext, useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useAppStore } from '../stores';

interface ThemeContextValue {
  theme: 'dark' | 'light';
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  setTheme: (theme: 'dark' | 'light') => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

// Color scheme based on theme
const getColors = (theme: 'dark' | 'light') => {
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

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { settings, setTheme: setAppTheme } = useAppStore();
  const theme = settings.theme;
  const colors = getColors(theme);

  const setTheme = (newTheme: 'dark' | 'light') => {
    setAppTheme(newTheme);
  };

  const contextValue: ThemeContextValue = {
    theme,
    colors,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};