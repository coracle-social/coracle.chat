import { spacing } from '@/core/env/Spacing';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import { common, text, withBorderRadius } from '@/lib/utils/styleUtils';
import React, { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';

interface EmojiReactionButtonProps {
  emoji: string;
  reaction: {
    count: number;
    userReacted: boolean;
    users: string[];
  };
  onEmojiPress: (emoji: string) => Promise<void>;
  isLoading?: boolean;
}

export const EmojiReactionButton: React.FC<EmojiReactionButtonProps> = ({
  emoji,
  reaction,
  onEmojiPress,
  isLoading = false
}) => {
  const colors = useThemeColors();
  const [isLocalLoading, setIsLocalLoading] = useState(false);

  const handlePress = async () => {
    if (isLoading || isLocalLoading) return;

    try {
      setIsLocalLoading(true);
      await onEmojiPress(emoji);
    } catch (error) {
      console.error('[EMOJI-REACTION-BUTTON] Error handling emoji press:', error);
      Alert.alert('Error', 'Failed to update reaction. Please try again.');
    } finally {
      setIsLocalLoading(false);
    }
  };

  const isUserReacted = reaction.userReacted;
  const isDisabled = isLoading || isLocalLoading;

  return (
    <TouchableOpacity
      style={[
        styles.unifiedButton,
        {
          backgroundColor: isUserReacted ? colors.primary + '20' : 'transparent',
          borderColor: isUserReacted ? colors.primary : colors.border,
        }
      ]}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      <Text style={styles.emojiText} numberOfLines={1}>{emoji}</Text>
      {reaction.count > 1 && (
        <Text style={[styles.countText, { color: colors.placeholder }]}>
          {reaction.count}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  unifiedButton: {
    ...common.flexRow,
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(0.5),
    ...withBorderRadius('lg'),
    borderWidth: 1,
    marginRight: spacing(0.5),
    marginBottom: spacing(0.5),
    minHeight: 28,
    maxWidth: '100%',
    flexShrink: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: {
    ...text.lg,
    flexShrink: 1,
  },
  countText: {
    ...text.sm,
    ...text.medium,
    marginLeft: spacing(0.5),
    flexShrink: 0,
  },
});
