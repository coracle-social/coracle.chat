import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/Colors';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useSystemColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('light'); // Start with light to prevent flicker
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved theme preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('themeMode');
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          setThemeMode(savedTheme as ThemeMode);
        }
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load theme preference:', error);
        setIsLoaded(true);
      }
    };
    loadThemePreference();
  }, []);

  const isDark = isLoaded && (themeMode === 'system'
    ? systemColorScheme === 'dark'
    : themeMode === 'dark');

  const saveThemePreference = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem('themeMode', mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const setThemeModeAndSave = (mode: ThemeMode) => {
    setThemeMode(mode);
    saveThemePreference(mode);
  };

  const toggleTheme = () => {
    const newMode = isDark ? 'light' : 'dark';
    setThemeModeAndSave(newMode);
  };

  const value: ThemeContextType = {
    themeMode,
    isDark,
    toggleTheme,
    setThemeMode: setThemeModeAndSave,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function useThemeColors() {
  const { isDark } = useTheme();
  const colorScheme = isDark ? 'dark' : 'light';
  return Colors[colorScheme];
}