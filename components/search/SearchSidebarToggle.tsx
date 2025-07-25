import Colors from '@/core/env/Colors';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Icon } from '@rneui/themed';
import React from 'react';
import { Animated, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';

interface SearchSidebarToggleProps {
  isOpen: boolean;
  onPress: () => void;
}

export const SearchSidebarToggle: React.FC<SearchSidebarToggleProps> = ({
  isOpen,
  onPress,
}) => {
  const { isDark } = useTheme();
  const colorScheme = isDark ? 'dark' : 'light';
  const colors = Colors[colorScheme];

  // Get screen dimensions for responsive sizing
  const { width: screenWidth } = Dimensions.get('window');
  const sidebarWidth = Math.min(280, screenWidth * 0.3);
  const toggleWidth = Math.max(32, sidebarWidth * 0.15); // Responsive toggle width

  // Animation values
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const widthAnim = React.useRef(new Animated.Value(toggleWidth)).current;

  // Animate on state change
  React.useEffect(() => {
    if (isOpen) {
      // Grow when opening
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(widthAnim, {
          toValue: toggleWidth * 1.5,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      // Shrink when closing
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(widthAnim, {
          toValue: toggleWidth,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [isOpen, toggleWidth]);

  return (
    <Animated.View
      style={[
        styles.toggleButton,
        {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
          transform: [{ scale: scaleAnim }],
          width: widthAnim,
          height: Math.max(60, screenWidth * 0.08), // Responsive height
          marginRight: -toggleWidth * 0.5, // Responsive margin
        }
      ]}
    >
      <TouchableOpacity
        style={styles.touchable}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Icon
          name={isOpen ? 'chevron-left' : 'chevron-right'}
          type="ionicon"
          size={Math.max(20, screenWidth * 0.025)} // Responsive icon size
          color={colors.surface}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toggleButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  touchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
