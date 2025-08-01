import { spacing } from '@/core/env/Spacing';
import { useEmojiPickerPopup } from '@/lib/hooks/useEmojiPickerPopup';
import { useEmojiReactions } from '@/lib/hooks/useEmojiReactions';
import { useSlideUpPopup } from '@/lib/hooks/useSlideUpPopup';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import { BareEvent } from '@/lib/types/search';
import {
  addEmojiReaction,
  convertEmojiTextToChar,
  isValidEmojiText,
  removeEmojiReaction
} from '@/lib/utils/emojiReactionUtils';
import { common, text, withBorderRadius } from '@/lib/utils/styleUtils';
import { pubkey } from '@welshman/app';
import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';

interface EmojiReactionsProps {
  result: BareEvent;
  maxVisible?: number; // Maximum number of emoji reactions to show before collapsing
}

export const EmojiReactions: React.FC<EmojiReactionsProps> = ({
  result,
  maxVisible = 2
}) => {
  const colors = useThemeColors();
  const [isLoading, setIsLoading] = useState(false);
  const [showAllEmojis, setShowAllEmojis] = useState(false);
  const {  showPopup } = useSlideUpPopup();
  const { openEmojiPicker } = useEmojiPickerPopup();

  const { emojiReactions, isLoading: isLoadingReactions, updateEmojiReaction, removeEmojiReactionFromState } = useEmojiReactions(result.event.id);

  // Filter and convert emoji reactions to only show valid emojis
  const validEmojiReactions = useMemo(() => {
    const valid: { [key: string]: any } = {};

    Object.entries(emojiReactions).forEach(([emojiText, reaction]) => {
      // Convert emoji text to actual emoji character
      const emojiChar = convertEmojiTextToChar(emojiText);

      // Only include if it's a valid emoji
      if (isValidEmojiText(emojiText)) {
        valid[emojiChar] = {
          ...reaction,
          emoji: emojiChar,
          originalText: emojiText // Store original text for API calls
        };
      }
    });

    return valid;
  }, [emojiReactions]);

  // Create a reverse mapping from emoji char to original text
  const emojiCharToOriginalText = useMemo(() => {
    const mapping: { [key: string]: string } = {};
    Object.entries(emojiReactions).forEach(([emojiText, reaction]) => {
      const emojiChar = convertEmojiTextToChar(emojiText);
      if (isValidEmojiText(emojiText)) {
        mapping[emojiChar] = emojiText;
      }
    });
    return mapping;
  }, [emojiReactions]);

  const handleEmojiPress = async (emojiChar: string) => {
    console.log('[EMOJI-REACTIONS] handleEmojiPress called with emoji:', emojiChar);
    if (isLoading) return;

    // Check if user is logged in
    const currentUserPubkey = pubkey.get();
    if (!currentUserPubkey) {
      showPopup('You must login to react', 'warning');
      return;
    }

    // Get the original emoji text for API calls
    const originalEmojiText = emojiCharToOriginalText[emojiChar] || emojiChar;

    try {
      setIsLoading(true);
      const userReacted = validEmojiReactions[emojiChar]?.userReacted || false;
      console.log('[EMOJI-REACTIONS] User reacted:', userReacted, 'for emoji:', originalEmojiText);

      if (userReacted) {
        // Remove reaction
        console.log('[EMOJI-REACTIONS] Removing reaction for emoji:', originalEmojiText);
        await removeEmojiReaction(result.event, originalEmojiText);
        const newCount = Math.max(0, (validEmojiReactions[emojiChar]?.count || 0) - 1);
        const newUsers = (validEmojiReactions[emojiChar]?.users || []).filter((u: string) => u !== currentUserPubkey);

        if (newCount === 0) {
          removeEmojiReactionFromState(originalEmojiText);
        } else {
          updateEmojiReaction(originalEmojiText, newCount, false, newUsers);
        }
      } else {
        // Add reaction
        console.log('[EMOJI-REACTIONS] Adding reaction for emoji:', originalEmojiText);
        await addEmojiReaction(result.event, originalEmojiText);
        const newCount = (validEmojiReactions[emojiChar]?.count || 0) + 1;
        const newUsers = [...(validEmojiReactions[emojiChar]?.users || []), currentUserPubkey];
        updateEmojiReaction(originalEmojiText, newCount, true, newUsers);
      }
    } catch (error) {
      console.error('[EMOJI-REACTIONS] Error handling emoji reaction:', error);
      Alert.alert('Error', 'Failed to update reaction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddReaction = async (emoji: string) => {
    console.log('[EMOJI-REACTIONS] handleAddReaction called with emoji:', emoji);
    await handleEmojiPress(emoji);
  };

  const renderEmojiReaction = (emoji: string, reaction: any) => {
    const isUserReacted = reaction.userReacted;

    return (
      <TouchableOpacity
        key={emoji}
        style={[
          styles.unifiedButton,
          {
            backgroundColor: isUserReacted ? colors.primary + '20' : 'transparent',
            borderColor: isUserReacted ? colors.primary : colors.border,
          }
        ]}
        onPress={() => handleEmojiPress(emoji)}
        disabled={isLoading}
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

  const emojiEntries = Object.entries(validEmojiReactions);
  // Auto-expand to show more emojis if there are more than maxVisible (approximately 2 lines worth)
  const shouldAutoExpand = emojiEntries.length > maxVisible && emojiEntries.length <= maxVisible && !showAllEmojis;
  const visibleEmojis = shouldAutoExpand || showAllEmojis ? emojiEntries : emojiEntries.slice(0, maxVisible);
  const hasMoreEmojis = emojiEntries.length > maxVisible && !showAllEmojis;

  // Show loading state when reactions are being loaded
  if (isLoadingReactions) {
    return (
      <TouchableOpacity
        style={[styles.unifiedButton, { borderColor: colors.interactiveBorder }]}
        onPress={() => openEmojiPicker(handleAddReaction)}
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
        onPress={() => openEmojiPicker(handleAddReaction)}
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
        onPress={() => openEmojiPicker(handleAddReaction)}
      >
        <Text style={[styles.addReactionText, { color: colors.interactiveIcon }]}>
          +
        </Text>
      </TouchableOpacity>

      {visibleEmojis.map(([emoji, reaction]) =>
        renderEmojiReaction(emoji, reaction)
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
  emojiButton: {
    // Uses unifiedButton as base
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
  moreButton: {
    // Uses unifiedButton as base
  },
  moreText: {
    ...text.sm,
    ...text.medium,
  },
  addReactionButton: {
    // Uses unifiedButton as base
  },
  addReactionText: {
    ...text.lg,
    ...text.semibold,
  },
});
