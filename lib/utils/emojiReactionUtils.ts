import { pubkey, publishThunk, repository, tagEventForReaction } from '@welshman/app';
import { Router } from '@welshman/router';
import type { TrustedEvent } from '@welshman/util';
import { makeEvent, REACTION } from '@welshman/util';
import emojiList from 'emoji.json';

export interface EmojiReaction {
  emoji: string;
  count: number;
  userReacted: boolean;
  users: string[]; // Array of pubkeys who reacted with this emoji
}

export interface EmojiReactionGroup {
  [emoji: string]: EmojiReaction;
}

/**
 * Get all emoji reactions for an event (excluding likes/replies/reposts)
 * @param eventId - The ID of the event to get reactions for
 * @returns Promise that resolves to emoji reaction groups
 */
export const getEmojiReactions = async (eventId: string): Promise<EmojiReactionGroup> => {
  try {
    const currentUserPubkey = pubkey.get();

    const reactionFilter = {
      kinds: [REACTION],
      '#e': [eventId],
    };

    const allReactions = repository.query([reactionFilter]);

    // Group reactions by emoji
    const reactionGroups: { [emoji: string]: EmojiReaction } = {};

    for (const reaction of allReactions) {
      const emoji = reaction.content;

      if (isLikeReaction(emoji) || isRepostReaction(emoji)) {
        continue;
      }
      if (!isValidEmojiText(emoji)) {
        console.log('[EMOJI-REACTION] Skipping invalid emoji:', emoji);
        continue;
      }

      if (!reactionGroups[emoji]) {
        reactionGroups[emoji] = {
          emoji,
          count: 0,
          userReacted: false,
          users: []
        };
      }

      reactionGroups[emoji].count++;
      reactionGroups[emoji].users.push(reaction.pubkey);

      // Check if current user reacted with this emoji
      if (currentUserPubkey && reaction.pubkey === currentUserPubkey) {
        reactionGroups[emoji].userReacted = true;
      }
    }

    return reactionGroups;
  } catch (error) {
    console.error('[EMOJI-REACTION] Error getting emoji reactions:', error);
    return {};
  }
};

/**
 * Add an emoji reaction to an event
 * @param event - The event to react to
 * @param emoji - The emoji to add
 */
export const addEmojiReaction = async (event: TrustedEvent, emoji: string): Promise<void> => {
  try {
    console.log('[EMOJI-REACTION] Adding emoji reaction:', emoji, 'for event:', event.id);
    console.log('[EMOJI-REACTION] Event details:', { id: event.id, pubkey: event.pubkey, content: event.content?.substring(0, 50) });

    const tags = tagEventForReaction(event);
    console.log('[EMOJI-REACTION] Generated tags:', tags);

    const reactionEvent = makeEvent(REACTION, {
      content: emoji,
      tags
    });
    console.log('[EMOJI-REACTION] Created reaction event:', { content: reactionEvent.content, tags: reactionEvent.tags });

    const publishUrls = Router.get().PublishEvent(event).getUrls();
    console.log('[EMOJI-REACTION] Publishing to relays:', publishUrls);

    await publishThunk({
      event: reactionEvent,
      relays: publishUrls
    });

    console.log('[EMOJI-REACTION] Emoji reaction published successfully');
  } catch (error) {
    console.error('[EMOJI-REACTION] Error adding emoji reaction:', error);
    throw error;
  }
};

/**
 * Remove an emoji reaction from an event
 * @param event - The event to remove reaction from
 * @param emoji - The emoji to remove
 */
export const removeEmojiReaction = async (event: TrustedEvent, emoji: string): Promise<void> => {
  try {
    console.log('[EMOJI-REACTION] Removing emoji reaction:', emoji, 'for event:', event.id);

    const currentUserPubkey = pubkey.get();
    if (!currentUserPubkey) {
      throw new Error('User not logged in');
    }

    // Find existing reaction by this user
    const reactionFilter = {
      kinds: [REACTION],
      '#e': [event.id],
      authors: [currentUserPubkey],
    };

    const existingReactions = repository.query([reactionFilter]);
    const userReaction = existingReactions.find(r => r.content === emoji);

    if (userReaction) {
      // Create a negative reaction to "remove" the positive one
      const tags = tagEventForReaction(event);

      const removalEvent = makeEvent(REACTION, {
        content: `-${emoji}`, // Negative emoji reaction
        tags
      });

      await publishThunk({
        event: removalEvent,
        relays: Router.get().PublishEvent(event).getUrls()
      });

      console.log('[EMOJI-REACTION] Emoji reaction removed successfully');
    }
  } catch (error) {
    console.error('[EMOJI-REACTION] Error removing emoji reaction:', error);
    throw error;
  }
};

/**
 * Check if a reaction content is a like reaction
 */
export const isLikeReaction = (content: string): boolean => {
  const likeReactions = ['+', '❤️', 'like', '👍', 'heart', 'love'];
  return likeReactions.includes(content.toLowerCase());
};

/**
 * Check if a reaction content is a repost reaction
 */
export const isRepostReaction = (content: string): boolean => {
  const repostReactions = ['repost', '🔁', 'retweet', 'share', '📤'];
  return repostReactions.includes(content.toLowerCase());
};

/**
 * Check if a reaction content is an emoji reaction (not like/repost)
 */
export const isEmojiReaction = (content: string): boolean => {
  return !isLikeReaction(content) && !isRepostReaction(content);
};

/**
 * Convert emoji text representation to actual emoji character
 * @param emojiText - The emoji text
 * @returns The actual emoji character or the original text if not found
 */
export const convertEmojiTextToChar = (emojiText: string): string => {
  if (isEmojiCharacter(emojiText)) {
    return emojiText;
  }

  // Remove colons if present
  const cleanText = emojiText.replace(/^:|:$/g, '');

  const emoji = emojiList.find((e: any) => {
    if (e.name === cleanText) return true;

    if (e.aliases && e.aliases.includes(cleanText)) return true;

    if (e.name.includes(cleanText) || cleanText.includes(e.name)) return true;

    return false;
  });

  if (emoji) {
    return emoji.char || emojiText;
  }

  return emojiText;
};

/**
 * Check if a string is already an emoji character
 * @param text - The text to check
 * @returns True if it's an emoji character
 */
export const isEmojiCharacter = (text: string): boolean => {
  // Simple check for emoji characters (Unicode emoji ranges)
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}-\u{2454}]|[\u{20D0}-\u{20FF}]|[\u{FE00}-\u{FE0F}]|[\u{1F3FB}-\u{1F3FF}]|[\u{1F9B0}-\u{1F9B3}]|[\u{1F1E6}-\u{1F1FF}]|[\u{1F004}]|[\u{1F0CF}]|[\u{1F170}-\u{1F251}]|[\u{1F17E}-\u{1F17F}]|[\u{1F18E}]|[\u{3030}]|[\u{2B50}]|[\u{2B55}]|[\u{2934}-\u{2935}]|[\u{2194}-\u{2199}]|[\u{21A9}-\u{21AA}]|[\u{231A}-\u{231B}]|[\u{23E9}-\u{23EC}]|[\u{23F0}]|[\u{23F3}]|[\u{25FD}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2705}]|[\u{270A}-\u{270B}]|[\u{2728}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2795}-\u{2797}]|[\u{27B0}]|[\u{27BF}]|[\u{2B1B}-\u{2B1C}]|[\u{2B50}]|[\u{2B55}]|[\u{1F004}]|[\u{1F0CF}]|[\u{1F170}-\u{1F251}]|[\u{1F17E}-\u{1F17F}]|[\u{1F18E}]|[\u{3030}]|[\u{2B50}]|[\u{2B55}]|[\u{2934}-\u{2935}]|[\u{2194}-\u{2199}]|[\u{21A9}-\u{21AA}]|[\u{231A}-\u{231B}]|[\u{23E9}-\u{23EC}]|[\u{23F0}]|[\u{23F3}]|[\u{25FD}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2705}]|[\u{270A}-\u{270B}]|[\u{2728}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2795}-\u{2797}]|[\u{27B0}]|[\u{27BF}]|[\u{2B1B}-\u{2B1C}]|[\u{2B50}]|[\u{2B55}]/u;
  return emojiRegex.test(text);
};

/**
 * Check if an emoji text can be converted to a valid emoji character
 * @param emojiText - The emoji text to check
 * @returns True if it can be converted to a valid emoji
 */
//this currently misses some emojis like foreign characters or :purple-heart:
export const isValidEmojiText = (emojiText: string): boolean => {
  const converted = convertEmojiTextToChar(emojiText);
  return isEmojiCharacter(converted);
};
