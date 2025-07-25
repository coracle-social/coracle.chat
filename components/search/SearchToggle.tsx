import { spacing } from '@/core/env/Spacing';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export type SearchEngineType = 'default' | 'preference';

interface SearchToggleProps {
  currentEngine: SearchEngineType;
  onEngineChange: (engine: SearchEngineType) => void;
}

export const SearchToggle: React.FC<SearchToggleProps> = ({
  currentEngine,
  onEngineChange,
}) => {
  const { isDark } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            {
              backgroundColor: currentEngine === 'default'
                ? (isDark ? '#4dabf7' : '#2f95dc')
                : (isDark ? '#2a2a2a' : '#f0f0f0'),
              borderColor: currentEngine === 'default'
                ? (isDark ? '#4dabf7' : '#2f95dc')
                : (isDark ? '#404040' : '#d0d0d0'),
            }
          ]}
          onPress={() => onEngineChange('default')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.toggleText,
            {
              color: currentEngine === 'default'
                ? '#ffffff'
                : (isDark ? '#ffffff' : '#000000')
            }
          ]}>
            Default Search
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            {
              backgroundColor: currentEngine === 'preference'
                ? (isDark ? '#4dabf7' : '#2f95dc')
                : (isDark ? '#2a2a2a' : '#f0f0f0'),
              borderColor: currentEngine === 'preference'
                ? (isDark ? '#4dabf7' : '#2f95dc')
                : (isDark ? '#404040' : '#d0d0d0'),
            }
          ]}
          onPress={() => onEngineChange('preference')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.toggleText,
            {
              color: currentEngine === 'preference'
                ? '#ffffff'
                : (isDark ? '#ffffff' : '#000000')
            }
          ]}>
            Preference Search
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing(1),
    paddingHorizontal: spacing(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
