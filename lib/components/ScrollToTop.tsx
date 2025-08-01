import { useTheme, useThemeColors } from '@/lib/theme/ThemeContext';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface ScrollToTopProps {
  visible: boolean;
  onPress: () => void;
  size?: number;
  bottom?: number;
  right?: number;
}

export const ScrollToTop: React.FC<ScrollToTopProps> = ({
  visible,
  onPress,
  size = 50,
  bottom = 32,
  right = 16,
}) => {
  const colors = useThemeColors();

  if (!visible) return null;

  return (
    <TouchableOpacity
      style={[
        styles.scrollToTopButton,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          bottom,
          right,
          backgroundColor: colors.primary,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.scrollToTopIcon, { color: colors.surface }]}>↑</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  scrollToTopButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scrollToTopIcon: {
    color: '#fff',
    fontSize: 24,
  },
});
