import { spacing } from '@/core/env/Spacing';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface HashtagProps {
  hashtag: string;
  onPress?: (hashtag: string) => void;
  inline?: boolean;
}

export const Hashtag: React.FC<HashtagProps> = ({
  hashtag,
  onPress,
  inline = false,
}) => {
  const colors = useThemeColors();

  const handlePress = () => {
    onPress?.(hashtag);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Text style={[
        styles.hashtag,
        inline && styles.inlineHashtag,
        {
          color: colors.primary,
          backgroundColor: colors.surfaceVariant,
        }
      ]}>
        {hashtag}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  hashtag: {
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
    borderRadius: 12,
    marginRight: spacing(2),
    marginBottom: spacing(2),
  },
  inlineHashtag: {
    fontSize: 13,
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(0.5),
    marginRight: spacing(1),
    marginBottom: spacing(1),
  },
});
