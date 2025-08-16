import React, { createContext, useContext, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useSettingsStore } from '../stores';
import { getContrastColors } from './GradientBackground';

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

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { settings, setTheme } = useSettingsStore();
  const theme = settings.theme;
  const colors = getContrastColors(theme);

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