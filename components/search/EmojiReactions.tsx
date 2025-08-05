import { spacing } from '@/core/env/Spacing';
import { useEmojiPickerPopup } from '@/lib/hooks/useEmojiPickerPopup';
import { useEmojiReactions } from '@/lib/hooks/useEmojiReactions';
import { useSlideUpPopup } from '@/lib/hooks/useSlideUpPopup';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import {
  addEmojiReaction,
  removeEmojiReaction
} from '@/lib/utils/emojiReactionUtils';
import { common, text, withBorderRadius } from '@/lib/utils/styleUtils';
import { pubkey } from '@welshman/app';
import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { EmojiReactionButton } from './EmojiReactionButton';

interface GenericEvent {
  id: string;
  pubkey: string;
  content: string;
  created_at: number;
  kind: number;
  tags: string[][];
  sig: string;
}

interface EmojiReactionsProps {
  event: GenericEvent;
  authorPubkey?: string;
  emojiCount?: number;
  replyCount?: number;
  maxVisible?: number; // Maximum number of emoji reactions to show before collapsing
}

export const EmojiReactions: React.FC<EmojiReactionsProps> = ({
  event,
  authorPubkey,
  emojiCount,
  replyCount,
  maxVisible = 2
}) => {
  const colors = useThemeColors();
  const [isLoading, setIsLoading] = useState(false);
  const [showAllEmojis, setShowAllEmojis] = useState(false);
  const { showPopup } = useSlideUpPopup();
  const { openEmojiPicker, handleEmojiSelect } = useEmojiPickerPopup();

  const { emojiReactions, isLoading: isLoadingReactions, updateEmojiReaction, removeEmojiReactionFromState } = useEmojiReactions(event.id);

  const handleEmojiPress = async (emoji: string) => {
    console.log('[EMOJI-REACTIONS] handleEmojiPress called with emoji:', emoji);
    if (isLoading) return;

    // Check if user is logged in
    const currentUserPubkey = pubkey.get();
    if (!currentUserPubkey) {
      console.log('[EMOJI-REACTIONS] currentUserPubkey is false, showing popup');
      showPopup('You must login to react', 'warning');
      //wont show anything yet, i removed the popup components
      //want a betteer solution with less code
      //probably a popup just onthe center of scren isntead of in each component
      return;
    }
    else {
      console.log('[EMOJI-REACTIONS] isLoading is fal222se, continuing');
    }

    try {
      setIsLoading(true);
      const userReacted = emojiReactions[emoji]?.userReacted || false;
      console.log('[EMOJI-REACTIONS] User reacted:', userReacted, 'for emoji:', emoji);

      if (userReacted) {
        // Remove reaction
        console.log('[EMOJI-REACTIONS] Removing reaction for emoji:', emoji);
        await removeEmojiReaction(event, emoji);
        const newCount = Math.max(0, (emojiReactions[emoji]?.count || 0) - 1);
        const newUsers = (emojiReactions[emoji]?.users || []).filter((u: string) => u !== currentUserPubkey);

              if (newCount === 0) {
        removeEmojiReactionFromState(emoji);
      } else {
        updateEmojiReaction(emoji, newCount, false, newUsers);
      }
      } else {
        // Add reaction
        console.log('[EMOJI-REACTIONS] Adding reaction for emoji:', emoji);
        await addEmojiReaction(event, emoji);
        const currentCount = emojiReactions[emoji]?.count || 0;
        const currentUsers = emojiReactions[emoji]?.users || [];
        const newCount = currentCount + 1;
        const newUsers = [...currentUsers, currentUserPubkey];
        updateEmojiReaction(emoji, newCount, true, newUsers);
      }
    } catch (error) {
      console.error('[EMOJI-REACTIONS] Error handling emoji reaction:', error);
      Alert.alert('Error', 'Failed to update reaction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddReaction = async (emoji: string) => {
    try {
      await handleEmojiPress(emoji);
    } catch (error) {
      console.error('[EMOJI-REACTIONS] Error in handleAddReaction:', error);
    }
  };

  // Override the handleEmojiSelect to use our local callback
  const handleEmojiSelectOverride = useCallback((emoji: string) => {
    handleAddReaction(emoji);
  }, []);

  const emojiEntries = Object.entries(emojiReactions);
  // Auto-expand to show more emojis if there are more than maxVisible (approximately 2 lines worth)
  const shouldAutoExpand = emojiEntries.length > maxVisible && emojiEntries.length <= maxVisible && !showAllEmojis;
  const visibleEmojis = shouldAutoExpand || showAllEmojis ? emojiEntries : emojiEntries.slice(0, maxVisible);
  const hasMoreEmojis = emojiEntries.length > maxVisible && !showAllEmojis;

  // Show loading state when reactions are being loaded
  if (isLoadingReactions) {
    return (
      <TouchableOpacity
        style={[styles.unifiedButton, { borderColor: colors.interactiveBorder }]}
        onPress={() => openEmojiPicker(handleEmojiSelectOverride)}
        disabled={true}
      >
        <Text style={[styles.addReactionText, { color: colors.placeholder }]}>
          ...
        </Text>
      </TouchableOpacity>
    );
  }

  if (emojiEntries.length === 0) {
    return (
      <TouchableOpacity
        style={[styles.unifiedButton, { borderColor: colors.interactiveBorder }]}
        onPress={() => openEmojiPicker(handleEmojiSelectOverride)}
      >
        <Text style={[styles.addReactionText, { color: colors.interactiveIcon }]}>
          +
        </Text>
      </TouchableOpacity>
    );
  }

    return (
    <>
      <TouchableOpacity
        style={[styles.unifiedButton, { borderColor: colors.interactiveBorder }]}
        onPress={() => openEmojiPicker(handleEmojiSelectOverride)}
      >
        <Text style={[styles.addReactionText, { color: colors.interactiveIcon }]}>
          +
        </Text>
      </TouchableOpacity>

      {visibleEmojis.map(([emoji, reaction]) =>
        <EmojiReactionButton
          key={emoji}
          emoji={emoji}
          reaction={reaction}
          onEmojiPress={handleEmojiPress}
          isLoading={isLoading}
        />
      )}

      {hasMoreEmojis && (
        <TouchableOpacity
          style={[styles.unifiedButton, { borderColor: colors.interactiveBorder }]}
          onPress={() => setShowAllEmojis(!showAllEmojis)}
        >
          <Text style={[styles.moreText, { color: colors.interactiveIcon }]}>
            +{emojiEntries.length - maxVisible}
          </Text>
        </TouchableOpacity>
      )}

      {showAllEmojis && emojiEntries.length > maxVisible && (
        <TouchableOpacity
          style={[styles.unifiedButton, { borderColor: colors.interactiveBorder }]}
          onPress={() => setShowAllEmojis(false)}
        >
          <Text style={[styles.moreText, { color: colors.interactiveIcon }]}>
            -
          </Text>
        </TouchableOpacity>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  // Unified button style for all reaction buttons
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
  moreText: {
    ...text.sm,
    ...text.medium,
  },
  addReactionText: {
    ...text.lg,
    ...text.semibold,
  },
});
