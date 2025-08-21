import { BareEvent } from '@/lib/types/search';
import { useMemo } from 'react';

export interface UseSearchResultsReturn {
  searchResults: BareEvent[];
}

export const useSearchResults = (
  profileEvents: BareEvent[],
  contentEvents: BareEvent[],
  selectedFilters: string[],
  selectedSort: string
): UseSearchResultsReturn => {
  const searchResults = useMemo(() => {
    let results: BareEvent[] = [];

    if (selectedFilters.includes('people')) {
      results = [...results, ...profileEvents];
    }
    if (selectedFilters.includes('content')) {
      results = [...results, ...contentEvents];
    }

    // Apply sorting to all tabs, if adding many more options separate tab sorts for clarity
    return results.sort((a, b) => {
      switch (selectedSort) {
        case 'date':
          // For profiles: use recent activity if available, fallback to creation date
          if (a.type === 'profile') {
            const aDate = a.event.created_at || 0;
            const bDate = b.event.created_at || 0;
            return bDate - aDate;
          } else {
            // For content: use creation timestamp
            return (b.event.created_at || 0) - (a.event.created_at || 0);
          }
        case 'popularity':
          // For content: use like count + reply count, for profiles: heavily weight follower/following counts
          if (a.type === 'profile' && b.type === 'profile') {
            const aScore = (a.followerCount || 0) + (a.followingCount || 0);
            const bScore = (b.followerCount || 0) + (b.followingCount || 0);
            return bScore - aScore;
          } else if (a.type === 'content' && b.type === 'content') {
            // For content: use emoji count + reply count for popularity
            const aScore = (a.emojiCount || 0) + (a.replyCount || 0);
            const bScore = (b.emojiCount || 0) + (b.replyCount || 0);
            return bScore - aScore;
          } else {
            // Mixed types: profiles first
            return a.type === 'profile' ? -1 : 1;
          }
        case 'trust':
          // For profiles: use trust score if available
          if (a.type === 'profile' && b.type === 'profile') {
            // Trust scores would need to be calculated separately
            // For now, use follower count as proxy
            const aScore = a.followerCount || 0;
            const bScore = b.followerCount || 0;
            return bScore - aScore;
          } else {
            // Mixed types: profiles first
            return a.type === 'profile' ? -1 : 1;
          }
        case 'relevance':
        default:
          // For now, use creation date as relevance proxy
          return (b.event.created_at || 0) - (a.event.created_at || 0);
      }
    });
  }, [profileEvents, contentEvents, selectedFilters, selectedSort]);

  return {
    searchResults,
  };
};
