import Colors from '@/core/env/Colors';
import { spacing } from '@/core/env/Spacing';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, useWindowDimensions } from 'react-native';

interface SlideUpPopupProps {
  isVisible: boolean;
  message: string;
  duration?: number;
  onHide?: () => void;
  type?: 'info' | 'warning' | 'error' | 'success';
  widthRatio?: number; // Proportion of parent width (0.0 to 1.0)
}

export const SlideUpPopup: React.FC<SlideUpPopupProps> = ({
  isVisible,
  message,
  duration = 2000,
  onHide,
  type = 'info',
  widthRatio = 0.5,
}) => {
  const { isDark } = useTheme();
  const colorScheme = isDark ? 'dark' : 'light';
  const colors = Colors[colorScheme];
  const { width: screenWidth } = useWindowDimensions();

  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Calculate popup width based on ratio
  const popupWidth = screenWidth * Math.max(0.1, Math.min(1.0, widthRatio));
  const sideSpacing = spacing(4);
  const containerWidth = popupWidth - (2 * sideSpacing);

  useEffect(() => {
    if (isVisible) {
      // Slide up animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hidePopup();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);

  const hidePopup = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide?.();
    });
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          backgroundColor: `${colors.warning}40`,
          borderColor: `${colors.warning}60`,
        };
      case 'error':
        return {
          backgroundColor: `${colors.error}20`,
          borderColor: `${colors.error}40`,
        };
      case 'success':
        return {
          backgroundColor: `${colors.success}20`,
          borderColor: `${colors.success}40`,
        };
      default:
        return {
          backgroundColor: `${colors.primary}20`,
          borderColor: `${colors.primary}40`,
        };
    }
  };

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
          width: popupWidth,
          alignSelf: 'center',
        },
      ]}
    >
      <View
        style={[
          styles.popup,
          getTypeStyles(),
          { borderColor: colors.border },
        ]}
      >
        <Text style={[styles.message, { color: colors.text }]}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing(4),
    zIndex: 1000,
    width: '100%',
  },
  popup: {
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});
