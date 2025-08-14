import { SEARCH_LIMITS } from '@/core/env/searchQualityConfig';
import { useStore } from '@/lib/stores/useWelshmanStore2';
import { BareEvent, WotSearchOptions } from '@/lib/types/search';
import {
    wotEnhancedProfileSearch,
} from '@/lib/utils/wotSearch';
import { profileSearch, pubkey } from '@welshman/app';
import { useCallback, useEffect, useState } from 'react';

export const useWotSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<BareEvent[]>([]);
  const [allResults, setAllResults] = useState<BareEvent[]>([]); // Store all results for filtering
  const [loading, setLoading] = useState(false);
  const [wotOptions, setWotOptions] = useState<WotSearchOptions>({
    trustLevels: ['high', 'medium'],
    networkDistance: 3, // Support up to 3 hops
    hasProfile: true,
    limit: SEARCH_LIMITS.wotSearchLimit
  });

  const [userPubkey] = useStore(pubkey);
  const [profileSearchStore] = useStore(profileSearch);

  // Filter results by trust levels
  const filterResultsByTrustLevels = useCallback((results: BareEvent[], trustLevels: string[]) => {
    if (trustLevels.length === 4) return results; // All trust levels selected
    return results.filter(result => trustLevels.includes(result.trustLevel || 'low'));
  }, []);

  // Update results when trust levels change
  useEffect(() => {
    if (allResults.length > 0) {
      const trustLevels = wotOptions.trustLevels || ['high', 'medium'];
      const filteredResults = filterResultsByTrustLevels(allResults, trustLevels);
      setResults(filteredResults);
    }
  }, [wotOptions.trustLevels, allResults, filterResultsByTrustLevels]);

  const performWotSearch = async (term: string) => {
    if (!term.trim() || !userPubkey) {
      return;
    }

    setLoading(true);
    try {
      // Use wotEnhancedProfileSearch which now uses the same profileSearchStore as regular search
      const searchResults = await wotEnhancedProfileSearch(term, wotOptions, profileSearchStore);
      setAllResults(searchResults); // Store all results
      setResults(searchResults); // Set initial results
    } catch (error) {
      console.error('[WOT-HOOK] WoT search failed:', error);
      setResults([]);
      setAllResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (searchTerm.length < 2) {
      setResults([]);
      return;
    }
    const timeoutId = setTimeout(() => performWotSearch(searchTerm), 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, wotOptions]);

  return {
    searchTerm,
    setSearchTerm,
    results,
    loading,
    wotOptions,
    setWotOptions,
    performWotSearch
  };
};
