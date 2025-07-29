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

    if (selectedFilters.includes('people')) {
      results = [...results, ...profileResults];
    }
    if (selectedFilters.includes('content')) {
      results = [...results, ...contentResults];
    }

    // Apply sorting to all tabs, if adding many more options separate tab sorts for clarity
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
            const aQualityWeight = (a.metadata.qualityScore || 0) * 100; // Quality score bonus
            // Only use trust score for WoT results (when trustLevel is present)
            const aTrustWeight = (a.metadata.trustLevel && a.metadata.trustScore) ? (a.metadata.trustScore || 0) * 0.3 : 0;
            const aPopularity = aFollowerWeight + aFollowingWeight + aQualityWeight + aActivityBonus + aTrustWeight;

            const bFollowerWeight = (b.metadata.followerCount || 0) * 2.0;
            const bFollowingWeight = (b.metadata.followingCount || 0) * 0.5;
            const bQualityWeight = (b.metadata.qualityScore || 0) * 100;
            const bTrustWeight = (b.metadata.trustLevel && b.metadata.trustScore) ? (b.metadata.trustScore || 0) * 0.3 : 0;
            const bPopularity = bFollowerWeight + bFollowingWeight + bQualityWeight + bActivityBonus + bTrustWeight;

            return bPopularity - aPopularity;
          }
        case 'trust':
          const aTrust = a.metadata.trustLevel && a.metadata.trustScore ? a.metadata.trustScore : 0;
          const bTrust = b.metadata.trustLevel && b.metadata.trustScore ? b.metadata.trustScore : 0;
          return bTrust - aTrust;
        case 'name':
          return (a.title || '').localeCompare(b.title || '');
        case 'relevance':
        default:
          if (a.type === 'content') {
            const aRelevance = (a.metadata.likeCount || 0);
            const bRelevance = (b.metadata.likeCount || 0);
            return bRelevance - aRelevance;
          } else {
            const now = Math.floor(Date.now() / 1000);
            const aActivityBonus = a.metadata.recentActivityTimestamp ?
              Math.max(0, 10 - Math.floor((now - a.metadata.recentActivityTimestamp) / (24 * 60 * 60))) : 0;
            const bActivityBonus = b.metadata.recentActivityTimestamp ?
              Math.max(0, 10 - Math.floor((now - b.metadata.recentActivityTimestamp) / (24 * 60 * 60))) : 0;

            const aTrustScore = a.metadata.trustLevel && a.metadata.trustScore ? a.metadata.trustScore : 0;
            const bTrustScore = b.metadata.trustLevel && b.metadata.trustScore ? b.metadata.trustScore : 0;
            const aRelevance = (a.metadata.followerCount || 0) * 0.1 + aActivityBonus + aTrustScore;
            const bRelevance = (b.metadata.followerCount || 0) * 0.1 + bActivityBonus + bTrustScore;
            return bRelevance - aRelevance;
          }
      }
    });
  }, [selectedFilters, profileResults, contentResults, selectedSort]);

  return {
    searchResults,
  };
};
