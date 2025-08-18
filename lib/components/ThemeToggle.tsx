import { spacing } from '@/core/env/Spacing';
import { useTheme, useThemeColors } from '@/lib/theme/ThemeContext';
import { Text, View } from '@/lib/theme/Themed';
import Feather from '@expo/vector-icons/Feather';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native';

// Platform-specific theme toggle components
export function ThemeToggleWeb() {
  const { isDark, toggleTheme } = useTheme();
  const colors = useThemeColors();

  return (
    <View style={styles.themeSection}>
      <Text style={[styles.themeToggleLabel, { color: colors.text }]}>
        Dark/Light Mode
      </Text>
      <TouchableOpacity
        style={[
          styles.themeToggleButton,
          {
            backgroundColor: colors.primary,
            borderColor: colors.border,
          }
        ]}
        onPress={toggleTheme}
      >
        <Feather
          name={isDark ? "sun" : "moon"}
          size={20}
          color={colors.surface}
        />
      </TouchableOpacity>
    </View>
  );
}

export function ThemeToggleMobile() {
  const { isDark, toggleTheme } = useTheme();
  const colors = useThemeColors();

  return (
    <TouchableOpacity
      style={[
        styles.floatingThemeToggle,
        {
          backgroundColor: colors.primary,
          borderColor: colors.border,
        }
      ]}
      onPress={toggleTheme}
    >
      <Feather
        name={isDark ? "sun" : "moon"}
        size={20}
        color={colors.surface}
      />
    </TouchableOpacity>
  );
}

// Main component that handles platform detection
export default function ThemeToggle() {
  if (Platform.OS === 'web') {
    return <ThemeToggleWeb />;
  }

  return <ThemeToggleMobile />;
}

const styles = StyleSheet.create({
  themeSection: {
    marginBottom: spacing(8),
  },
  themeToggleLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  themeToggleButton: {
    width: spacing(10),
    height: spacing(10),
    borderRadius: spacing(5),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  floatingThemeToggle: {
    position: 'absolute',
    bottom: spacing(6),
    right: spacing(6),
    width: spacing(12),
    height: spacing(12),
    borderRadius: spacing(6),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
