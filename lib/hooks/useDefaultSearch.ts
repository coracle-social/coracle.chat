import { SearchResult } from '@/lib/types/search';
import { loadCommentsForSearchResults, searchContentWithReactions } from '@/lib/utils/contentSearch';
import { isProfileLink, searchProfileByLink, searchProfilesWithWeighting } from '@/lib/utils/profileSearch';
import { useStore } from '@/stores/useWelshmanStore2';
import { profileSearch } from '@welshman/app';
import { useEffect, useState } from 'react';

export interface UseDefaultSearchReturn {
  // State
  searchTerm: string;
  profileResults: SearchResult[];
  contentResults: SearchResult[];
  isSearching: boolean;
  isLoadingMore: boolean;
  selectedFilters: string[];
  selectedSort: string;
  profileOffset: number;
  contentOffset: number;

  // Actions
  setSearchTerm: (term: string) => void;
  setSelectedFilters: (filters: string[]) => void;
  setSelectedSort: (sort: string) => void;
  performSearch: (term: string, isLoadMore?: boolean) => Promise<void>;
  loadMoreResults: () => Promise<void>;
}

export const useDefaultSearch = (): UseDefaultSearchReturn => {
  const [searchTerm, setSearchTerm] = useState('');
  const [profileResults, setProfileResults] = useState<SearchResult[]>([]);
  const [contentResults, setContentResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['people']);
  const [selectedSort, setSelectedSort] = useState('relevance');
  const [profileOffset, setProfileOffset] = useState(0);
  const [contentOffset, setContentOffset] = useState(0);

  const [profileSearchStore] = useStore(profileSearch);

  // Debounced search with profile link detection
  useEffect(() => {
    if (searchTerm.length < 2) {
      setProfileResults([]);
      setContentResults([]);
      setProfileOffset(0);
      setContentOffset(0);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setProfileOffset(0);
    setContentOffset(0);

    // Check if the search term looks like a profile link
    if (isProfileLink(searchTerm)) {
      console.log('[DEFAULT-SEARCH] Profile link detected:', searchTerm);

      // Use the new profile search by link
      searchProfileByLink(searchTerm).then(profileResult => {
        if (profileResult) {
          setProfileResults([profileResult]);
          setContentResults([]);
          setIsSearching(false);
        } else {
          // If profile not found, perform regular search
          performSearch(searchTerm);
        }
      }).catch(error => {
        console.error('[DEFAULT-SEARCH] Error searching profile by link:', error);
        // Fallback to regular search
        performSearch(searchTerm);
      });
    } else {
      // Perform regular search
      performSearch(searchTerm);
    }
  }, [searchTerm, selectedFilters]);

  const performSearch = async (term: string, isLoadMore = false) => {
    try {
      const newProfileResults: SearchResult[] = [];
      const newContentResults: SearchResult[] = [];

      if (selectedFilters.includes('people')) {
        const profileSearchResult = await searchProfilesWithWeighting({
          term,
          isLoadMore,
          offset: profileOffset,
          limit: 50,
          profileSearchStore,
        });

        newProfileResults.push(...profileSearchResult.results);

        if (isLoadMore) {
          setProfileOffset(profileSearchResult.newOffset);
        } else {
          setProfileOffset(50);
        }
      }

      if (selectedFilters.includes('content')) {
        const contentSearchResult = await searchContentWithReactions({
          term,
          isLoadMore,
          offset: contentOffset,
          limit: 50,
        });

        newContentResults.push(...contentSearchResult.results);

        if (isLoadMore) {
          setContentOffset(contentSearchResult.newOffset);
        } else {
          setContentOffset(50);
        }
      }

      if (isLoadMore) {
        setProfileResults(prev => {
          const existingIds = new Set(prev.map(r => r.id));
          const uniqueNewProfiles = newProfileResults.filter(r => !existingIds.has(r.id));
          return [...prev, ...uniqueNewProfiles];
        });
        setContentResults(prev => {
          const existingIds = new Set(prev.map(r => r.id));
          const uniqueNewContent = newContentResults.filter(r => !existingIds.has(r.id));
          return [...prev, ...uniqueNewContent];
        });
      } else {
        setProfileResults(newProfileResults);
        setContentResults(newContentResults);
      }

      // Load comment counts in background after search results are displayed
      if (newContentResults.length > 0) {
        // Don't await this - let it run in background
        loadCommentsForSearchResults(newContentResults).catch(error => {
          console.error('[DEFAULT-SEARCH] Background comment loading failed:', error);
        });
      }
    } catch (error) {
      console.error('🔍 Search error:', error);
    } finally {
      setIsSearching(false);
      setIsLoadingMore(false);
    }
  };

  const loadMoreResults = async () => {
    if (isLoadingMore || isSearching) return;
    setIsLoadingMore(true);
    await performSearch(searchTerm, true);
  };

  return {
    searchTerm,
    profileResults,
    contentResults,
    isSearching,
    isLoadingMore,
    selectedFilters,
    selectedSort,
    profileOffset,
    contentOffset,
    setSearchTerm,
    setSelectedFilters,
    setSelectedSort,
    performSearch,
    loadMoreResults,
  };
};
