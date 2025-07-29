import { SearchResult } from '@/lib/types/search';
import { repository } from '@welshman/app';
import { request } from '@welshman/net';
import { Router } from '@welshman/router';
import type { StampedEvent } from '@welshman/util';
import { COMMENT, Filter, LONG_FORM, NOTE } from '@welshman/util';
import { Platform } from 'react-native';
import { debugEventInRepository } from './commentUtils';

export interface ContentSearchOptions {
  term: string;
  isLoadMore?: boolean;
  offset?: number;
  limit?: number;
}

export interface ContentSearchResult {
  results: SearchResult[];
  newOffset: number;
}

/**
 * Search content with reaction loading and quality filtering
 */
export const searchContentWithReactions = async (options: ContentSearchOptions): Promise<ContentSearchResult> => {
  const { term, isLoadMore = false, offset = 0, limit = 50 } = options;

  const newContentResults: SearchResult[] = [];

  const contentFilter: Filter = {
    kinds: [NOTE, LONG_FORM, COMMENT],
    search: term,
    limit: 50,
  };

  let localEvents: any[] = [];

  if (Platform.OS === 'web') {
    localEvents = repository.query([contentFilter]);
  } else {
    localEvents = repository.query([contentFilter]);
  }
  // Apply pagination directly to the original dataset
  const startIndex = isLoadMore ? offset : 0;
  const endIndex = startIndex + limit;
  const eventsToProcess = localEvents.slice(startIndex, endIndex);

  const startTime = Date.now();

  const allEventIds = eventsToProcess.map(e => e.id);
  const reactionBatchFilter: Filter = {
    kinds: [7],
    '#e': allEventIds,
  };

  if (Platform.OS === 'web') {
    await request({
      filters: [reactionBatchFilter],
      relays: Router.get().Index().getUrls(),
      autoClose: true,
      threshold: 0.1,
      onEvent: (event, url) => {
        console.log(`[CONTENT-SEARCH] Reaction event loaded from relay: ${url}`, event.id)
      },
      onEose: (url) => {
        //console.log(`EOSE from ${url}`)
      },
      onDisconnect: (url) => {
        //console.log(`Disconnected from ${url}`)
      }
    });
  } else {
    await request({
      filters: [reactionBatchFilter],
      relays: Router.get().Index().getUrls(),
      autoClose: true,
      threshold: 0.1,
      onEvent: (event, url) => {
        console.log(`[CONTENT-SEARCH] Reaction event loaded from relay: ${url}`, event.id)
      },
      onEose: (url) => {
        //console.log(`EOSE from ${url}`)
      },
      onDisconnect: (url) => {
        //console.log(`Disconnected from ${url}`)
      }
    });
  }

  const allReactions = repository.query([reactionBatchFilter]);

  // eventId -> list of reactions
  const reactionMap = new Map<string, StampedEvent[]>();
  for (const reaction of allReactions) {
    const targetId = reaction.tags.find(tag => tag[0] === 'e')?.[1];
    if (targetId) {
      if (!reactionMap.has(targetId)) {
        reactionMap.set(targetId, []);
      }
      reactionMap.get(targetId)!.push(reaction);
    }
  }

  // Process events with proper async comment counting
  const processedEvents: any[] = [];

  for (const event of eventsToProcess) {
    const reactions = reactionMap.get(event.id) || [];

    const likeCount = reactions.filter(reaction => {
      const content = reaction.content?.toLowerCase() || '';
      return content === '+' ||
             content === '❤️' ||
             content === 'like' ||
             content === '👍' ||
             content === 'heart' ||
             content === 'love';
    }).length;

    // Get comment count from local repository only (no relay loading during search)
    console.log(`[CONTENT-SEARCH] Processing event: ${event.id}`);

    // Debug the first few events to see what's in the repository
    if (eventsToProcess.indexOf(event) < 3) {
      debugEventInRepository(event.id);
    }

    // Use local repository only for comment count to avoid blocking search
    const commentFilter: Filter = {
      kinds: [NOTE],
      '#e': [event.id],
    };
    const localComments = repository.query([commentFilter]);
    const replyCount = localComments.filter(comment => comment.id !== event.id).length;
    console.log(`[CONTENT-SEARCH] Event ${event.id} has ${replyCount} local comments`);

    const repostCount = reactions.filter(reaction => {
      const content = reaction.content?.toLowerCase() || '';
      return content === 'repost' ||
             content === '🔁' ||
             content === 'retweet' ||
             content === 'share' ||
             content === '📤';
    }).length;

    // Quality filtering for content
    const contentLength = event.content?.length || 0;
    const hasMinimalContent = contentLength >= 10; // At least 10 characters
    const hasMinimalEngagement = likeCount >= 1 || replyCount >= 1 || repostCount >= 1; // At least some engagement
    const hasReasonableLength = contentLength <= 10000; // Not too long (avoid spam)
    const hasValidContent = event.content && typeof event.content === 'string' && event.content.trim().length > 0;

    // Keep content that meets quality criteria
    if (hasMinimalContent && hasValidContent && hasReasonableLength) {
      // Calculate quality score for content
      const qualityScore = Math.min(
        (likeCount / 100) + // Normalize likes (100+ = 1.0)
        (replyCount / 50) +  // Normalize replies (50+ = 1.0)
        (repostCount / 25) + // Normalize reposts (25+ = 1.0)
        (contentLength / 1000), // Content length bonus (1000+ chars = 1.0)
        1.0
      );

      //where fuzzy search weighting would go
      const combinedScore = qualityScore;

      processedEvents.push({
        event,
        likeCount,
        replyCount,
        repostCount,
        qualityScore,
        combinedScore,
      });
    }
  }

  processedEvents.sort((a, b) => (b.combinedScore || 0) - (a.combinedScore || 0));

  // Take top results based on combined score
  const topEvents = processedEvents.slice(0, limit);

  for (const { event, likeCount, replyCount, repostCount, qualityScore } of topEvents) {
    newContentResults.push({
      id: `content-${event.id}`,
      type: 'content',
      metadata: {
        timestamp: event.created_at,
        author: event.pubkey.substring(0, 8) + '...',
        authorPubkey: event.pubkey,
        likeCount: likeCount,
        replyCount: replyCount,
        repostCount: repostCount,
        qualityScore: qualityScore,
        // 🪙 add zapCount: ... here in future
      },
      event: event,
    });
  }

  const endTime = Date.now();

  const newOffset = isLoadMore ? offset + limit : limit;

  // Load more content from relays in background
  await loadContentFromRelays(term);

  return {
    results: newContentResults,
    newOffset
  };
};

/**
 * Load comments for all content results in background
 * This is called after search results are displayed to improve UX
 * @param results - Array of search results to load comments for
 */
export const loadCommentsForSearchResults = async (results: SearchResult[]): Promise<void> => {
  try {
    // Extract event IDs from content results
    const contentEventIds = results
      .filter(result => result.type === 'content')
      .map(result => result.event.id);

    if (contentEventIds.length === 0) return;

    console.log(`[CONTENT-SEARCH] Loading comments for ${contentEventIds.length} content results in background`);

    const { loadCommentCountsFromRelays } = await import('./commentUtils');

    await loadCommentCountsFromRelays(contentEventIds);

    console.log(`[CONTENT-SEARCH] Background comment loading completed for ${contentEventIds.length} events`);
  } catch (error) {
    console.error('[CONTENT-SEARCH] Error loading comments for search results:', error);
  }
};

/**
 * Load content from relays in the background
 */
export const loadContentFromRelays = async (term: string) => {
  try {
    const contentFilter: Filter = {
      kinds: [NOTE, LONG_FORM, COMMENT],
      search: term,
      limit: 50,
    };

    // Load more content from relays
    const searchRelays = Router.get().Search().getUrls();
    console.log(`[CONTENT-SEARCH] Loading content from relays:`, searchRelays);
    const indexRelays = Router.get().Index().getUrls();
    const relaysToUse = searchRelays.length > 0 ? searchRelays : indexRelays;


    if (Platform.OS === 'web') {
      await request({
        filters: [contentFilter],
        relays: relaysToUse,
        autoClose: true,
        threshold: 0.1,
        onEvent: (event, url) => {
          // console.log(`[CONTENT-SEARCH] Content event loaded from relay: ${url}`, event.id)
        },
        onEose: (url) => {
          //console.log(`EOSE from ${url}`)
        },
        onDisconnect: (url) => {
          //console.log(`Disconnected from ${url}`)
        }
      });
    } else {
      const _ = await request({
        filters: [contentFilter],
        relays: relaysToUse,
        autoClose: true,
        threshold: 0.1,
        onEvent: (event, url) => {
          console.log(`[CONTENT-SEARCH] Content event loaded from relay: ${url}`, event.id)
        },
        onEose: (url) => {
          //console.log(`EOSE from ${url}`)
        },
        onDisconnect: (url) => {
          //console.log(`Disconnected from ${url}`)
        }
      });
    }
  } catch (error) {
    console.error('[CONTENT-SEARCH] Error loading content from relays:', error);
  }
};
