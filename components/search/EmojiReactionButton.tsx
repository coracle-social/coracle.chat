import { spacing } from '@/core/env/Spacing';
import { useStore } from '@/lib/stores/useWelshmanStore2';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import { common, text, withBorderRadius } from '@/lib/utils/styleUtils';
import { pubkey, repository } from '@welshman/app';
import { deriveEvents } from '@welshman/store';
import { REACTION } from '@welshman/util';
import React, { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';

interface EmojiReactionButtonProps {
  emoji: string;
  eventId: string;
  onEmojiPress: (emoji: string) => Promise<void>;
  isLoading?: boolean;
}

export const EmojiReactionButton: React.FC<EmojiReactionButtonProps> = ({
  emoji,
  eventId,
  onEmojiPress,
  isLoading = false
}) => {
  const colors = useThemeColors();
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [currentPubkey] = useStore(pubkey);

  // Get reactions for this specific emoji and event from repository
  const reactions = deriveEvents(repository, {
    filters: [{kinds: [REACTION], "#e": [eventId]}]
  });

  // Use the store reactively
  const [reactionsData] = useStore(reactions);

  // Filter reactions for this specific emoji
  const emojiReactions = (reactionsData || []).filter((r: any) => r.content === emoji);
  const reactionCount = emojiReactions.length;
  const userReacted = emojiReactions.some((r: any) => r.pubkey === currentPubkey);


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

  const isDisabled = isLoading || isLocalLoading;

  return (
    <TouchableOpacity
      style={[
        styles.unifiedButton,
        {
          backgroundColor: userReacted ? '#FF450020' : 'transparent',
          borderColor: userReacted ? '#FF4500' : colors.border,
        }
      ]}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      <Text style={styles.emojiText} numberOfLines={1}>{emoji}</Text>
      {reactionCount > 1 && (
        <Text style={[styles.countText, { color: colors.placeholder }]}>
          {reactionCount}
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
