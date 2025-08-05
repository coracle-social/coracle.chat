import { getEmojiReactions } from '@/lib/utils/emojiReactionUtils';
import { useEffect, useState } from 'react';

export const useEmojiReactions = (eventId: string) => {
  const [emojiReactions, setEmojiReactions] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  const loadEmojiReactions = async () => {
    try {
      console.log(`[USE-EMOJI-REACTIONS] Loading reactions for event: ${eventId}`);
      setIsLoading(true);

      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Loading timeout')), 10000); // 10 second timeout
      });

      const reactionsPromise = getEmojiReactions(eventId);
      const reactions = await Promise.race([reactionsPromise, timeoutPromise]) as Record<string, any>;

      console.log(`[USE-EMOJI-REACTIONS] Loaded ${Object.keys(reactions).length} reaction types for event: ${eventId}`);
      setEmojiReactions(reactions);
      setLastUpdated(Date.now());
    } catch (error) {
      console.error('[USE-EMOJI-REACTIONS] Error loading emoji reactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateEmojiReaction = (emoji: string, count: number, userReacted: boolean, users: string[]) => {
    setEmojiReactions(prev => ({
      ...prev,
      [emoji]: {
        emoji,
        count,
        userReacted,
        users
      }
    }));
    setLastUpdated(Date.now());
  };

  const removeEmojiReactionFromState = (emoji: string) => {
    setEmojiReactions(prev => {
      const { [emoji]: removed, ...rest } = prev;
      return rest;
    });
    setLastUpdated(Date.now());
  };

  useEffect(() => {
    loadEmojiReactions();
  }, [eventId]);

  return {
    emojiReactions,
    isLoading,
    lastUpdated,
    loadEmojiReactions,
    updateEmojiReaction,
    removeEmojiReactionFromState
  };
};
