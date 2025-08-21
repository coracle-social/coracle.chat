import { SEARCH_LIMITS } from '@/core/env/searchQualityConfig';
import { BareEvent, ContentSearchOptions, ContentSearchResult } from '@/lib/types/search';
import { repository } from '@welshman/app';
import { COMMENT, Filter, getReplyFilters, LONG_FORM, NOTE } from '@welshman/util';
import { loadContent } from './relayLoadingUtils';

export const searchContentWithReactions = async (options: ContentSearchOptions): Promise<ContentSearchResult> => {
  const { term, isLoadMore = false, offset = 0, limit = SEARCH_LIMITS.defaultContentLimit } = options;

  // Use Welshman's content search with pagination
  const contentFilter: Filter = {
    kinds: [NOTE, LONG_FORM, COMMENT],
    search: term,
    limit: limit, // Apply limit in the filter itself
    since: isLoadMore ? offset : undefined, // Use since for pagination
  };

  // Single repository query with proper pagination
  const localEvents = repository.query([contentFilter]);

  // Load content from relays if needed
  await loadContent(contentFilter, {
    onContentEvent: (event, url) => {
      console.log(`[CONTENT-SEARCH] Content event loaded from relay: ${url}`, event.id);
    }
  });

  // Process events efficiently
  const processedEvents = localEvents.map(event => {
    // Use Welshman's getReplyFilters for efficient reply counting
    const replyFilters = getReplyFilters([event]);
    const replyCount = replyFilters.length > 0
      ? repository.query(replyFilters).length
      : 0;

    return {
      ...event,
      replyCount,
    };
  });

  // Convert to BareEvent format
  const newContentResults: BareEvent[] = processedEvents.map(event => ({
    id: `content-${event.id}`,
    type: 'content',
    event: {
      id: event.id,
      pubkey: event.pubkey,
      created_at: event.created_at,
      kind: event.kind,
      tags: event.tags,
      content: event.content,
      sig: event.sig,
    },
    authorPubkey: event.pubkey,
    replyCount: event.replyCount,
  }));

  const newOffset = isLoadMore ? offset + limit : limit;

  console.log(`[CONTENT-SEARCH] Processed ${newContentResults.length} events`);

  return {
    results: newContentResults,
    newOffset,
  };
};
