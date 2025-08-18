import { spacing } from '@/core/env/Spacing';
import { useImageSizing } from '@/lib/hooks/useImageSizing';
import { useUserPreferences } from '@/lib/hooks/useUserPreferences';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import { common, layout, text, withShadow } from '@/lib/utils/styleUtils';
import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export const SearchToolbar: React.FC = () => {
  const colors = useThemeColors();
  const { currentStrategy, availableStrategies, cycleToNextStrategy } = useImageSizing();
  const { postLength, urlPreviews, togglePostLength, toggleUrlPreviews } = useUserPreferences();

  return (
    <View style={styles.toolbar}>
      {/* Image Sizing Toggle */}
      <TouchableOpacity
        style={[styles.toolbarButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={cycleToNextStrategy}
      >
        <Feather name="image" size={16} color={colors.text} />
        <Text style={[styles.toolbarButtonText, { color: colors.text }]}>
          {availableStrategies.find(s => s.config === currentStrategy)?.name || 'Images'}
        </Text>
      </TouchableOpacity>

      {/* Post Length Toggle */}
      <TouchableOpacity
        style={[styles.toolbarButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={togglePostLength}
      >
        <Feather name="file-text" size={16} color={colors.text} />
        <Text style={[styles.toolbarButtonText, { color: colors.text }]}>
          {postLength === 'mini' ? 'Mini Posts' : 'Full Posts'}
        </Text>
      </TouchableOpacity>

      {/* URL Preview Toggle */}
      <TouchableOpacity
        style={[styles.toolbarButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={toggleUrlPreviews}
      >
        <Feather name="link" size={16} color={colors.text} />
        <Text style={[styles.toolbarButtonText, { color: colors.text }]}>
          {urlPreviews === 'enabled' ? 'Previews On' : 'Previews Off'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  toolbar: {
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  toolbarRow: {
    ...layout.spaceBetween,
    flexWrap: 'wrap',
    gap: spacing(1),
  },
  imageSizingButton: {
    ...common.flexRow,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
    borderRadius: spacing(1.5),
    borderWidth: 1,
    ...withShadow('small'),
  },
  imageSizingContent: {
    ...common.flexRow,
    gap: spacing(0.5),
  },
  imageSizingText: {
    ...text.xs,
    ...text.medium,
  },
  postLengthButton: {
    ...common.flexRow,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
    borderRadius: spacing(1.5),
    borderWidth: 1,
    ...withShadow('small'),
  },
  postLengthContent: {
    ...common.flexRow,
    gap: spacing(0.5),
  },
  postLengthText: {
    ...text.xs,
    ...text.medium,
  },
  urlPreviewButton: {
    ...common.flexRow,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
    borderRadius: spacing(1.5),
    borderWidth: 1,
    ...withShadow('small'),
  },
  urlPreviewContent: {
    ...common.flexRow,
    gap: spacing(0.5),
  },
  urlPreviewText: {
    ...text.xs,
    ...text.medium,
  },
  toolbarButton: {
    ...common.flexRow,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
    borderRadius: spacing(1.5),
    borderWidth: 1,
    ...withShadow('small'),
  },
  toolbarButtonText: {
    ...text.xs,
    ...text.medium,
    marginLeft: spacing(0.5),
  },
});
