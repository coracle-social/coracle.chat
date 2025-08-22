import { useThemeColors } from '@/lib/theme/ThemeContext';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';

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

  // Mobile-specific positioning
  const isMobile = Platform.OS !== 'web';
  const mobileBottom = -25; // Lower position on mobile
  const mobileRight = '50%'; // Center horizontally on mobile
  const mobileTransform = isMobile ? [{ translateX: size / 2 }] : undefined; // Adjust for centering

  return (
    <TouchableOpacity
      style={[
        styles.scrollToTopButton,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          bottom: isMobile ? mobileBottom : bottom,
          right: isMobile ? mobileRight : right,
          backgroundColor: colors.primary,
          transform: mobileTransform,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.scrollToTopIcon, { color: colors.surface }]}>⌃</Text>
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
    fontSize: 26,
    lineHeight: 24,
    marginTop: -10, // Position at top edge of bubble
  },
});
