import { colorPalettes } from '@/core/env/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';
type PaletteType = 'default';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  currentPalette: PaletteType;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  setPalette: (palette: PaletteType) => void;
  getColors: () => any;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useSystemColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('light'); // Start with light to prevent flicker
  const [currentPalette, setCurrentPalette] = useState<PaletteType>('default');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved theme preference
  useEffect(() => {
    const loadThemePreference = async () => {
      const savedTheme = await AsyncStorage.getItem('themeMode');
      const savedPalette = await AsyncStorage.getItem('currentPalette');

      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeMode(savedTheme as ThemeMode);
      }

      if (savedPalette && ['default'].includes(savedPalette)) {
        setCurrentPalette(savedPalette as PaletteType);
      }

      setIsLoaded(true);
    };
    loadThemePreference();
  }, []);

  const isDark = isLoaded && (themeMode === 'system'
    ? systemColorScheme === 'dark'
    : themeMode === 'dark');

  const saveThemePreference = async (mode: ThemeMode) => {
    await AsyncStorage.setItem('themeMode', mode);
  };

  const savePalettePreference = async (palette: PaletteType) => {
    await AsyncStorage.setItem('currentPalette', palette);
  };

  const setThemeModeAndSave = (mode: ThemeMode) => {
    setThemeMode(mode);
    saveThemePreference(mode);
  };

  const setPaletteAndSave = (palette: PaletteType) => {
    setCurrentPalette(palette);
    savePalettePreference(palette);
  };

  const toggleTheme = () => {
    const newMode = isDark ? 'light' : 'dark';
    setThemeModeAndSave(newMode);
  };

  const getColors = () => {
    const colorScheme = isDark ? 'dark' : 'light';
    return colorPalettes[currentPalette][colorScheme];
  };

  const value: ThemeContextType = {
    themeMode,
    isDark,
    currentPalette,
    toggleTheme,
    setThemeMode: setThemeModeAndSave,
    setPalette: setPaletteAndSave,
    getColors,
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
  const { getColors } = useTheme();
  return getColors();
}
