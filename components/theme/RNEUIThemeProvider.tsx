import React from 'react';
import { ThemeProvider as RNEUIThemeProvider, createTheme } from '@rneui/themed';
import { useTheme } from './ThemeContext';
import Colors from '@/constants/Colors';

export function RNEUIThemeWrapper({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme();
  const colorScheme = isDark ? 'dark' : 'light';
  const colors = Colors[colorScheme];

  const theme = createTheme({
    lightColors: {
      primary: colors.primary,
      secondary: colors.secondary,
      success: colors.success,
      warning: colors.warning,
      error: colors.error,
      background: colors.background,
    },
    darkColors: {
      primary: colors.primary,
      secondary: colors.secondary,
      success: colors.success,
      warning: colors.warning,
      error: colors.error,
      background: colors.background,
    },
    mode: colorScheme,
  });

  return (
    <RNEUIThemeProvider theme={theme}>
      {children}
    </RNEUIThemeProvider>
  );
} 