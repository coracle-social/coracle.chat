import { spacing } from '@/core/env/Spacing';
import { useThemeColors } from '@/lib/theme/ThemeContext';
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
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            {
              backgroundColor: currentEngine === 'default'
                ? colors.primary
                : colors.surfaceVariant,
              borderColor: currentEngine === 'default'
                ? colors.primary
                : colors.border,
            }
          ]}
          onPress={() => onEngineChange('default')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.toggleText,
            {
              color: currentEngine === 'default'
                ? colors.surface
                : colors.text
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
                ? colors.primary
                : colors.surfaceVariant,
              borderColor: currentEngine === 'preference'
                ? colors.primary
                : colors.border,
            }
          ]}
          onPress={() => onEngineChange('preference')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.toggleText,
            {
              color: currentEngine === 'preference'
                ? colors.surface
                : colors.text
            }
          ]}>
            Preference Search8
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
