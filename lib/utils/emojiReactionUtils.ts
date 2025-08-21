import { pubkey, repository } from '@welshman/app';
import { groupBy } from '@welshman/lib';
import { REACTION } from '@welshman/util';
import emojiList from 'emoji.json';
import { getRelayUrls, loadFromRelays } from './relayLoadingUtils';

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
 * Get all emoji reactions for an event (excluding reposts)
 * @param eventId - The ID of the event to get reactions for
 * @param loadFromRelays - Whether to load reactions from relays if not found locally
 * @returns Promise that resolves to emoji reaction groups
 */
export const getEmojiReactions = async (eventId: string, shouldLoadFromRelays = true): Promise<EmojiReactionGroup> => {
  try {
    const currentUserPubkey = pubkey.get();

    const reactionFilter = {
      kinds: [REACTION],
      '#e': [eventId],
    };

    // First, try to get reactions from local repository
    let allReactions = repository.query([reactionFilter]);

    if (shouldLoadFromRelays) {
      console.log(`[EMOJI-REACTION] Loading reactions from relays for ${eventId}...`);

      const relayUrls = getRelayUrls();

      await loadFromRelays({
        filters: [reactionFilter],
        relays: relayUrls,
        onEvent: (event: any, url: string) => {
          console.log(`[EMOJI-REACTION] Reaction event loaded from relay: ${url}`, event.id);
        }
      });

      // Query again after loading from relays
      allReactions = repository.query([reactionFilter]);
      console.log(`[EMOJI-REACTION] Loaded ${allReactions.length} reactions from relays for ${eventId}`);
    }

    // Filter out repost reactions and invalid emojis
    const validReactions = allReactions.filter(reaction => {
      const emoji = reaction.content;
      return !isRepostReaction(emoji) && isValidEmojiText(emoji);
    });
    // Group reactions by emoji using groupBy function
    const reactionsByEmoji = groupBy(
      (reaction) => reaction.content, // Key function: group by emoji content
      validReactions
    );
    // Convert grouped reactions to EmojiReactionGroup format
    const reactionGroups: { [emoji: string]: EmojiReaction } = {};

    for (const [emoji, reactions] of reactionsByEmoji) {
      const users = reactions.map(r => r.pubkey);
      const userReacted = currentUserPubkey ? users.includes(currentUserPubkey) : false;

      reactionGroups[emoji] = {
        emoji,
        count: reactions.length,
        userReacted,
        users
      };
    }

    return reactionGroups;
  } catch (error) {
    console.error('[EMOJI-REACTION] Error getting emoji reactions:', error);
    return {};
  }
};

export const isRepostReaction = (content: string): boolean => {
  const repostReactions = ['repost', '🔁', 'retweet', 'share', '📤'];
  return repostReactions.includes(content.toLowerCase());
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
  // Simplified emoji regex covering most common ranges
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{2B50}]|[\u{2B55}]|[\u{2934}-\u{2935}]|[\u{2194}-\u{2199}]|[\u{21A9}-\u{21AA}]|[\u{23E9}-\u{23EC}]|[\u{25FD}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2705}]|[\u{270A}-\u{270B}]|[\u{2728}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2795}-\u{2797}]|[\u{27B0}]|[\u{27BF}]|[\u{2B1B}-\u{2B1C}]/u;
  return emojiRegex.test(text);
};

//this currently misses some emojis like foreign characters or :purple-heart:
export const isValidEmojiText = (emojiText: string): boolean => {
  const converted = convertEmojiTextToChar(emojiText);
  return isEmojiCharacter(converted);
};
