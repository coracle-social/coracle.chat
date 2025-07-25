import { SearchResult } from '@/lib/types/search';
import { repository } from '@welshman/app';
import { load, request } from '@welshman/net';
import { Router } from '@welshman/router';
import type { StampedEvent } from '@welshman/util';
import { COMMENT, Filter, LONG_FORM, NOTE } from '@welshman/util';
import { Platform } from 'react-native';

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

  // 🆕 Batch reaction filter (kind 7) using multiple '#e' tags
  const allEventIds = eventsToProcess.map(e => e.id);
  const reactionBatchFilter: Filter = {
    kinds: [7],
    '#e': allEventIds,
  };

  if (Platform.OS === 'web') {
    await load({
      filters: [reactionBatchFilter],
      relays: Router.get().Index().getUrls(),
    });
  } else {
    await request({
      filters: [reactionBatchFilter],
      relays: Router.get().Index().getUrls(),
      autoClose: true,
      threshold: 0.1,
      onEvent: (event, url) => {
        console.log(`Reaction event from ${url}:`, event.id)
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

  // 🗺️ Map: eventId -> list of reactions
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

  // Process events and apply quality filtering
  const processedEvents = [];

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

    const replyCount = reactions.filter(reaction => {
      const content = reaction.content?.toLowerCase() || '';
      return content === '' ||
             content === '💬' ||
             content === 'reply' ||
             content === 'comment' ||
             content === '💭';
    }).length;

    const repostCount = reactions.filter(reaction => {
      const content = reaction.content?.toLowerCase() || '';
      return content === 'repost' ||
             content === '🔁' ||
             content === 'retweet' ||
             content === 'share' ||
             content === '📤';
    }).length;

    // Debug logging for reaction detection
    if (reactions.length > 0) {
      console.log(`[CONTENT-SEARCH] Event ${event.id.substring(0, 8)}... has ${reactions.length} reactions:`, {
        likeCount,
        replyCount,
        repostCount,
        sampleReactions: reactions.slice(0, 3).map(r => r.content)
      });
    }

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

      // Use quality score as the main score since we removed fuzzy search
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
  const durationMs = endTime - startTime;
  console.info(`⏱️ Reaction fetch & processing took ${durationMs} ms for ${eventsToProcess.length} events`);
  console.info(`Average: ${(durationMs / eventsToProcess.length).toFixed(2)} ms per event`);
  console.info(`Quality filtering: ${eventsToProcess.length} → ${topEvents.length} events`);
  console.info(`🔍 Content search processed ${localEvents.length} events, found ${eventsToProcess.length} for current page`);

  const newOffset = isLoadMore ? offset + limit : limit;

  // Load more content from relays in background
  await loadContentFromRelays(term);

  return {
    results: newContentResults,
    newOffset
  };
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
    const indexRelays = Router.get().Index().getUrls();
    const relaysToUse = searchRelays.length > 0 ? searchRelays : indexRelays;


    if (Platform.OS === 'web') {
      const contentLoad = await load({
        filters: [contentFilter],
        relays: relaysToUse,
      });
    } else {
      const _ = await request({
        filters: [contentFilter],
        relays: relaysToUse,
        autoClose: true,
        threshold: 0.1,
        onEvent: (event, url) => {
          // console.log(`Content event from ${url}:`, event.id)
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
