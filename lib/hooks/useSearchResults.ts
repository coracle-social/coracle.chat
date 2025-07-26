import { SearchResult } from '@/lib/types/search';
import { useMemo } from 'react';

export interface UseSearchResultsReturn {
  searchResults: SearchResult[];
}

export const useSearchResults = (
  profileResults: SearchResult[],
  contentResults: SearchResult[],
  selectedFilters: string[],
  selectedSort: string
): UseSearchResultsReturn => {
  const searchResults = useMemo(() => {
    let results: SearchResult[] = [];

    // Determine which results to include based on selected filters
    if (selectedFilters.includes('people')) {
      results = [...results, ...profileResults];
    }
    if (selectedFilters.includes('content')) {
      results = [...results, ...contentResults];
    }

    // Apply sorting to all tabs
    return results.sort((a, b) => {
      switch (selectedSort) {
        case 'date':
          // For profiles: use recent activity if available, fallback to creation date
          if (a.type === 'profile') {
            const aDate = a.metadata.recentActivityTimestamp || a.metadata.timestamp || 0;
            const bDate = b.metadata.recentActivityTimestamp || b.metadata.timestamp || 0;
            return bDate - aDate;
          } else {
            // For content: use creation timestamp
            return (b.metadata.timestamp || 0) - (a.metadata.timestamp || 0);
          }
        case 'popularity':
          // For content: use like count, for profiles: heavily weight follower/following counts
          if (a.type === 'content') {
            const aPopularity = (a.metadata.likeCount || 0) + (a.metadata.qualityScore || 0) * 50;
            const bPopularity = (b.metadata.likeCount || 0) + (b.metadata.qualityScore || 0) * 50;
            return bPopularity - aPopularity;
          } else {
            // For profiles: heavily weight follower and following counts
            const now = Math.floor(Date.now() / 1000);
            const aActivityBonus = a.metadata.recentActivityTimestamp ?
              Math.max(0, 5 - Math.floor((now - a.metadata.recentActivityTimestamp) / (24 * 60 * 60))) * 10 : 0; // Activity within 5 days gets bonus
            const bActivityBonus = b.metadata.recentActivityTimestamp ?
              Math.max(0, 5 - Math.floor((now - b.metadata.recentActivityTimestamp) / (24 * 60 * 60))) * 10 : 0;

            const aFollowerWeight = (a.metadata.followerCount || 0) * 2.0; // Heavy weight for followers
            const aFollowingWeight = (a.metadata.followingCount || 0) * 0.5; // Medium weight for following
            const aTrustWeight = (a.metadata.trustScore || 0) * 0.3; // Light weight for trust score
            const aQualityWeight = (a.metadata.qualityScore || 0) * 100; // Quality score bonus
            const aPopularity = aFollowerWeight + aFollowingWeight + aTrustWeight + aQualityWeight + aActivityBonus;

            const bFollowerWeight = (b.metadata.followerCount || 0) * 2.0;
            const bFollowingWeight = (b.metadata.followingCount || 0) * 0.5;
            const bTrustWeight = (b.metadata.trustScore || 0) * 0.3;
            const bQualityWeight = (b.metadata.qualityScore || 0) * 100;
            const bPopularity = bFollowerWeight + bFollowingWeight + bTrustWeight + bQualityWeight + bActivityBonus;

            return bPopularity - aPopularity;
          }
        case 'trust':
          // Use verification score for both profiles and content
          const aTrust = a.metadata.trustScore || 0;
          const bTrust = b.metadata.trustScore || 0;
          return bTrust - aTrust;
        case 'name':
          return (a.title || '').localeCompare(b.title || '');
        case 'relevance':
        default:
          // Relevance: prioritize verified profiles and content with more engagement
          if (a.type === 'content') {
            const aRelevance = (a.metadata.verified ? 2 : 0) + (a.metadata.likeCount || 0) + (a.metadata.trustScore || 0);
            const bRelevance = (b.metadata.verified ? 2 : 0) + (b.metadata.likeCount || 0) + (b.metadata.trustScore || 0);
            return bRelevance - aRelevance;
          } else {
            // For profiles: consider verification, follower count, trust score, and recent activity
            const now = Math.floor(Date.now() / 1000);
            const aActivityBonus = a.metadata.recentActivityTimestamp ?
              Math.max(0, 10 - Math.floor((now - a.metadata.recentActivityTimestamp) / (24 * 60 * 60))) : 0; // Activity within 10 days gets bonus
            const bActivityBonus = b.metadata.recentActivityTimestamp ?
              Math.max(0, 10 - Math.floor((now - b.metadata.recentActivityTimestamp) / (24 * 60 * 60))) : 0;

            const aRelevance = (a.metadata.verified ? 3 : 0) + (a.metadata.followerCount || 0) * 0.1 + (a.metadata.trustScore || 0) + aActivityBonus;
            const bRelevance = (b.metadata.verified ? 3 : 0) + (b.metadata.followerCount || 0) * 0.1 + (b.metadata.trustScore || 0) + bActivityBonus;
            return bRelevance - aRelevance;
          }
      }
    });
  }, [selectedFilters, profileResults, contentResults, selectedSort]);

  return {
    searchResults,
  };
};
