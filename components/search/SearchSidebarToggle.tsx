import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Icon } from '@rneui/themed';
import React from 'react';
import { Dimensions, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

interface SearchSidebarToggleProps {
  isOpen: boolean;
  onPress: () => void;
  sidebarWidth?: number;
}

export const SearchSidebarToggle: React.FC<SearchSidebarToggleProps> = ({
  isOpen,
  onPress,
  sidebarWidth = 0,
}) => {
  const colors = useThemeColors();

  // Get screen dimensions for responsive sizing
  const { width: screenWidth } = Dimensions.get('window');
  const toggleWidth = Math.max(24, screenWidth * 0.025); // Smaller responsive toggle width

  // Only show on web
  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <View
      style={[
        styles.toggleButton,
        {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
          width: toggleWidth,
          height: Math.max(40, screenWidth * 0.05), // Smaller height
          left: isOpen ? sidebarWidth : 0, // Position relative to sidebar
          top: '50%',
          marginTop: -Math.max(20, screenWidth * 0.025), // Center vertically with smaller offset
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
          size={Math.max(16, screenWidth * 0.02)} // Smaller responsive icon size
          color={colors.surface}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  toggleButton: {
    position: 'absolute',
    left: 0,
    zIndex: 1001, // Higher than sidebar
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
