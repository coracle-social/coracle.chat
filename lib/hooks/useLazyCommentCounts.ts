import { getLocalCommentCount } from '@/lib/utils/commentUtils';
import { useEffect, useRef, useState } from 'react';
import { loadCommentsForEvents } from '../utils/relayLoadingUtils';

interface UseLazyCommentCountsOptions {
  eventIds: string[];
  enabled?: boolean;
  loadFromRelays?: boolean;
}

export const useLazyCommentCounts = ({
  eventIds,
  enabled = true,
  loadFromRelays = true
}: UseLazyCommentCountsOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const lastEventIds = useRef<string>('');

  // Load comment counts from relays in background
  useEffect(() => {
    if (!enabled || eventIds.length === 0 || !loadFromRelays) return;

    // Create a stable string representation of eventIds
    const eventIdsString = eventIds.sort().join(',');

    // Only load if the eventIds have actually changed
    if (eventIdsString === lastEventIds.current) return;

    lastEventIds.current = eventIdsString;
    console.log(`[LAZY-COMMENT-COUNTS] Loading comment counts for ${eventIds.length} events`);

    setIsLoading(true);

    // Load comment counts from relays in background
    loadCommentsForEvents(eventIds, {
      onCommentEvent: (event, url) => {
        console.log(`[COMMENT-UTILS] Comment event loaded from relay: ${url}`, event.id);
      }
    }).then(() => {
      setIsLoading(false);
    }).catch(error => {
      console.error('[LAZY-COMMENT-COUNTS] Error loading comment counts:', error);
      setIsLoading(false);
    });
  }, [eventIds, enabled, loadFromRelays]);

  // Function to get comment count from repository (always fresh)
  const getCommentCount = (eventId: string): number => {
    return getLocalCommentCount(eventId);
  };

  return {
    getCommentCount,
    isLoading
  };
};
