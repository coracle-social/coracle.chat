import Colors from '@/core/env/Colors';
import { spacing } from '@/core/env/Spacing';
import { useImageSizing } from '@/lib/hooks/useImageSizing';
import { usePostLength } from '@/lib/hooks/usePostLength';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export const SearchToolbar: React.FC = () => {
  const { isDark } = useTheme();
  const { currentStrategy, availableStrategies, cycleToNextStrategy } = useImageSizing();
  const { currentMode, availableModes, cycleToNextMode } = usePostLength();
  const colorScheme = isDark ? 'dark' : 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={styles.toolbar}>
      <View style={styles.toolbarRow}>
        <TouchableOpacity
          style={[
            styles.imageSizingButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }
          ]}
          onPress={cycleToNextStrategy}
          activeOpacity={0.7}
        >
          <View style={styles.imageSizingContent}>
            <Feather name="image" size={12} color={colors.primary} />
            <Text style={[styles.imageSizingText, { color: colors.text }]}>
              {availableStrategies.find(s => s.config === currentStrategy)?.name || 'Images'}
            </Text>
            <Feather name="chevron-right" size={10} color={colors.placeholder} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.postLengthButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }
          ]}
          onPress={cycleToNextMode}
          activeOpacity={0.7}
        >
          <View style={styles.postLengthContent}>
            <Feather name="file-text" size={12} color={colors.primary} />
            <Text style={[styles.postLengthText, { color: colors.text }]}>
              {availableModes.find(m => m.mode === currentMode)?.name || 'Short'}
            </Text>
            <Feather name="chevron-right" size={10} color={colors.placeholder} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  toolbar: {
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  toolbarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing(1),
  },
  imageSizingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
    borderRadius: spacing(1.5),
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  imageSizingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(0.5),
  },
  imageSizingText: {
    fontSize: 10,
    fontWeight: '500',
  },
  postLengthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
    borderRadius: spacing(1.5),
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  postLengthContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(0.5),
  },
  postLengthText: {
    fontSize: 10,
    fontWeight: '500',
  },
});
