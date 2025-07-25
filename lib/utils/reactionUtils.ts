import { pubkey, publishThunk, repository, tagEventForReaction } from '@welshman/app';
import { Router } from '@welshman/router';
import type { TrustedEvent } from '@welshman/util';
import { makeEvent, REACTION } from '@welshman/util';

/**
 * Checks if the current user has already reacted to an event
 * @param eventId - The ID of the event to check
 * @param reactionContent - The reaction content to check for
 * @returns Promise that resolves to true if user has already reacted
 */
export const hasUserReacted = async (
  eventId: string,
  reactionContent: string = '+'
): Promise<boolean> => {
  try {
    const currentUserPubkey = pubkey.get();
    if (!currentUserPubkey) return false;

    const reactionFilter = {
      kinds: [REACTION],
      '#e': [eventId],
      authors: [currentUserPubkey],
    };

    const existingReactions = repository.query([reactionFilter]);

    return existingReactions.some(reaction =>
      reaction.content === reactionContent
    );
  } catch (error) {
    console.error('[REACTION] Error checking existing reactions:', error);
    return false;
  }
};

/**
 * Gets the user's existing reaction to an event
 * @param eventId - The ID of the event to check
 * @returns Promise that resolves to the reaction content or null
 */
export const getUserReaction = async (eventId: string): Promise<string | null> => {
  try {
    const currentUserPubkey = pubkey.get();
    if (!currentUserPubkey) return null;

    const reactionFilter = {
      kinds: [REACTION],
      '#e': [eventId],
      authors: [currentUserPubkey],
    };

    const existingReactions = repository.query([reactionFilter]);

    if (existingReactions.length > 0) {
      return existingReactions[0].content;
    }

    return null;
  } catch (error) {
    console.error('[REACTION] Error getting user reaction:', error);
    return null;
  }
};

/**
 * Creates and publishes a reaction event
 * @param eventToReactTo - The event to react to
 * @param reactionContent - The reaction content (default: '+')
 * @returns Promise that resolves when the reaction is published
 */
export const createReaction = async (
  eventToReactTo: TrustedEvent,
  reactionContent: string = '+'
): Promise<void> => {
  try {
    console.log('[REACTION] Creating reaction:', reactionContent, 'for event:', eventToReactTo.id);

    const tags = tagEventForReaction(eventToReactTo);

    const reactionEvent = makeEvent(REACTION, {
      content: reactionContent,
      tags
    });

    await publishThunk({
      event: reactionEvent,
      relays: Router.get().PublishEvent(eventToReactTo).getUrls()
    });

    console.log('[REACTION] Reaction published successfully');
  } catch (error) {
    console.error('[REACTION] Error creating reaction:', error);
    throw error;
  }
};

/**
 * Like a post (creates a positive reaction)
 * @param event - The event to like
 */
export const likePost = async (event: TrustedEvent): Promise<void> => {
  await createReaction(event, '+');
};

/**
 * Unlike a post (creates a negative reaction)
 * @param event - The event to unlike
 */
export const unlikePost = async (event: TrustedEvent): Promise<void> => {
  await createReaction(event, '-');
};

/**
 * React with an emoji
 * @param event - The event to react to
 * @param emoji - The emoji to use (e.g., '❤️', '👍', '🔥')
 */
export const reactWithEmoji = async (event: TrustedEvent, emoji: string): Promise<void> => {
  await createReaction(event, emoji);
};
