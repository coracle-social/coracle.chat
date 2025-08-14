import { spacing } from '@/core/env/Spacing';
import { useEmojiPickerPopup } from '@/lib/hooks/useEmojiPickerPopup';
import { useSlideUpPopup } from '@/lib/hooks/useSlideUpPopup';
import { useStore } from '@/lib/stores/useWelshmanStore2';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import { getEmojiReactions } from '@/lib/utils/emojiReactionUtils';
import { common, text, withBorderRadius } from '@/lib/utils/styleUtils';
import { pubkey, publishThunk, repository } from '@welshman/app';
import { Router } from '@welshman/router';
import { deriveEvents } from '@welshman/store';
import { DELETE, makeEvent, REACTION } from '@welshman/util';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
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
  maxVisible?: number; // Maximum number of emoji reactions to show before collapsing
}

export const EmojiReactions: React.FC<EmojiReactionsProps> = ({
  event,
  maxVisible = 2
}) => {
  const colors = useThemeColors();
  const [isLoading, setIsLoading] = useState(false);
  const [showAllEmojis, setShowAllEmojis] = useState(false);
  const { showPopup } = useSlideUpPopup();
  const { openEmojiPicker } = useEmojiPickerPopup();
  const currentPubkey = useStore(pubkey);

  const reactions = deriveEvents(repository, {filters: [{kinds: [REACTION], "#e": [event.id]}]});
  const [emojiReactions, setEmojiReactions] = useState<Record<string, any>>({});
  const [isLoadingReactions, setIsLoadingReactions] = useState(false);

  // Load emoji reactions once on mount
  useEffect(() => {
    const loadReactions = async () => {
      try {
        console.log(`[EMOJI-REACTIONS] Loading reactions for event: ${event.id}`);
        setIsLoadingReactions(true);

        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Loading timeout')), 10000); // 10 second timeout
        });

        const reactionsPromise = getEmojiReactions(event.id);
        const reactions = await Promise.race([reactionsPromise, timeoutPromise]) as Record<string, any>;

        console.log(`[EMOJI-REACTIONS] Loaded ${Object.keys(reactions).length} reaction types for event: ${event.id}`);
        setEmojiReactions(reactions);
      } catch (error) {
        console.error('[EMOJI-REACTIONS] Error loading emoji reactions:', error);
      } finally {
        setIsLoadingReactions(false);
      }
    };

    loadReactions();
  }, [event.id]);

  const handleEmojiPress = useCallback(async (emoji: string) => {
    console.log('[EMOJI-REACTIONS] handleEmojiPress called with emoji:', emoji);
    // Check if user is logged in
    if (!currentPubkey) {
      console.log('[EMOJI-REACTIONS] currentPubkey is false, showing popup');
      showPopup('You must login to react', 'warning');
      //not currently working
      return;
    }

    setIsLoading(true);

    // Check if user already reacted by reading from repository
    const reactionsData = reactions.get() || [];
    const userReactions = reactionsData.filter((r: any) => r.pubkey === currentPubkey && r.content === emoji);
    const userReacted = userReactions.length > 0;

    if (userReacted) {
      publishThunk({
        event: makeEvent(DELETE, { tags: [["e", event.id]] }),
        relays: Router.get().FromUser().getUrls()
      });
    } else {
      publishThunk({
        event: makeEvent(REACTION, { content: emoji, tags: [["e", event.id]] }),
        relays: Router.get().FromUser().getUrls()
      });
    }
    setIsLoading(false);
  }, [currentPubkey, event.id, reactions, showPopup]);

  const handleAddReaction = useCallback(async (emoji: string) => {
    try {
      await handleEmojiPress(emoji);
    } catch (error) {
      console.error('[EMOJI-REACTIONS] Error in handleAddReaction:', error);
    }
  }, [handleEmojiPress]);

  // Override the handleEmojiSelect to use our local callback
  const handleEmojiSelectOverride = useCallback((emoji: string) => {
    handleAddReaction(emoji);
  }, [handleAddReaction]);

  const emojiEntries = Object.entries(emojiReactions);
  const visibleEmojis = showAllEmojis ? emojiEntries : emojiEntries.slice(0, maxVisible);
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
          eventId={event.id}
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
