import { spacing } from '@/core/env/Spacing';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { WotSearchOptions } from '@/lib/types/search';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface WotSearchFiltersProps {
  options: WotSearchOptions;
  onOptionsChange: (options: WotSearchOptions) => void;
}

export const WotSearchFilters: React.FC<WotSearchFiltersProps> = ({
  options,
  onOptionsChange
}) => {
  const colors = useThemeColors();

  const trustLevelOptions = [
    { value: 'high', label: 'High Trust', icon: '🛡️' },
    { value: 'medium', label: 'Medium Trust', icon: '⚖️' },
    { value: 'low', label: 'Low Trust', icon: '⚠️' },
  ];

  const networkDistanceOptions = [
    { value: 1, label: 'Direct Follows' },
    { value: 2, label: '2 Hops Away' },
    { value: 3, label: '3+ Hops Away' },
  ];

  return (
    <View style={styles.filtersContainer}>
      <Text style={[styles.filterTitle, { color: colors.text }]}>
        Trust Filters
      </Text>

      <View style={styles.filterRow}>
        {trustLevelOptions.map(option => (
          <Pressable
            key={option.value}
            style={[
              styles.filterChip,
              {
                backgroundColor: options.trustLevels?.includes(option.value as any)
                  ? colors.primary
                  : colors.surfaceVariant
              }
            ]}
            onPress={() => {
              const currentLevels = options.trustLevels || ['high', 'medium'];
              const newLevels = currentLevels.includes(option.value as 'high' | 'medium' | 'low')
                ? currentLevels.filter(l => l !== option.value)
                : [...currentLevels, option.value as 'high' | 'medium' | 'low'];

              onOptionsChange({
                ...options,
                trustLevels: newLevels
              });
            }}
          >
            <Text style={[styles.filterChipText, {
              color: options.trustLevels?.includes(option.value as any)
                ? colors.surface
                : colors.text
            }]}>
              {option.icon} {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.filterTitle, { color: colors.text }]}>
        Network Distance
      </Text>

      <View style={styles.filterRow}>
        {networkDistanceOptions.map(option => (
          <Pressable
            key={option.value}
            style={[
              styles.filterChip,
              {
                backgroundColor: options.networkDistance === option.value
                  ? colors.primary
                  : colors.surfaceVariant
              }
            ]}
            onPress={() => {
              onOptionsChange({
                ...options,
                networkDistance: option.value
              });
            }}
          >
            <Text style={[styles.filterChipText, {
              color: options.networkDistance === option.value
                ? colors.surface
                : colors.text
            }]}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  filtersContainer: {
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing(1),
    marginTop: spacing(1),
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(1),
    marginBottom: spacing(1),
  },
  filterChip: {
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
    borderRadius: spacing(2),
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
