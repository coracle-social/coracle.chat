import { useTheme } from './ThemeContext';

export function usePaperTheme() {
  const { isDark, getColors } = useTheme();
  const colors = getColors();

  return {
    colors: {
      primary: colors.primary, // Orange: #f16742
      secondary: colors.secondary, // Blue: #5b9ec3
      onSurface: colors.text,
      onSurfaceVariant: colors.text,
      surface: colors.surface,
      surfaceVariant: colors.surfaceVariant,
      background: colors.background,
      error: colors.error,
      warning: colors.warning,
      success: colors.success,
      info: colors.info,
      // Active state colors for drawer items and other components
      onPrimary: colors.activeTabText, // White text on primary background
      primaryContainer: colors.activeTabBackground, // Orange background for active states
      // Additional colors for better component theming
      outline: colors.border,
      outlineVariant: colors.divider,
      scrim: isDark ? 'rgba(0, 0, 0, 0.32)' : 'rgba(0, 0, 0, 0.32)',
      shadow: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)',
      inverseSurface: isDark ? colors.surface : colors.surfaceVariant,
      inverseOnSurface: isDark ? colors.text : colors.text,
      inversePrimary: colors.primary,
      // Required for React Native Paper components like Menu
      level0: colors.background,
      level1: colors.surface,
      level2: colors.surfaceVariant,
      level3: colors.surface,
      level4: colors.surface,
      onLevel0: colors.text,
      onLevel1: colors.text,
      onLevel2: colors.text,
      onLevel3: colors.text,
      onLevel4: colors.text,
    },
  };
}
