import { useStore } from '@/lib/stores/useWelshmanStore2';
import { BareEvent } from '@/lib/types/search';
import { searchContentWithReactions } from '@/lib/utils/contentSearch';
import { isProfileLink, searchProfileByLink, searchProfilesWithWeighting } from '@/lib/utils/profileSearch';
import { profileSearch } from '@welshman/app';
import { useEffect, useState } from 'react';

export interface UseDefaultSearchReturn {
  // State
  searchTerm: string;
  profileEvents: BareEvent[];
  contentEvents: BareEvent[];
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
  const [profileEvents, setProfileEvents] = useState<BareEvent[]>([]);
  const [contentEvents, setContentEvents] = useState<BareEvent[]>([]);
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
      setProfileEvents([]);
      setContentEvents([]);
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

      searchProfileByLink(searchTerm).then(profileResult => {
        if (profileResult) {
          setProfileEvents([profileResult]); // Now returns BareEvent
          setContentEvents([]);
          setIsSearching(false);
        } else {
          // If profile not found, perform regular search
          performSearch(searchTerm);
        }
      }).catch(error => {
        console.error('[DEFAULT-SEARCH] Error searching profile by link:', error);
        performSearch(searchTerm);
      });
    } else {
      // Perform regular search
      performSearch(searchTerm);
    }
  }, [searchTerm]);

  // Handle filter changes separately to avoid infinite loops
  useEffect(() => {
    if (searchTerm.length >= 2) {
      setIsSearching(true);
      setProfileOffset(0);
      setContentOffset(0);
      performSearch(searchTerm);
    }
  }, [selectedFilters]);

  const performSearch = async (term: string, isLoadMore = false) => {
    try {
      const newProfileEvents: BareEvent[] = [];
      const newContentEvents: BareEvent[] = [];

      if (selectedFilters.includes('people')) {
        const profileSearchResult = await searchProfilesWithWeighting({
          term,
          isLoadMore,
          offset: profileOffset,
          limit: 50,
          profileSearchStore,
        });

        newProfileEvents.push(...profileSearchResult.results);

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

        newContentEvents.push(...contentSearchResult.results);

        if (isLoadMore) {
          setContentOffset(contentSearchResult.newOffset);
        } else {
          setContentOffset(50);
        }
      }

      if (isLoadMore) {
        setProfileEvents(prev => {
          const existingIds = new Set(prev.map(e => e.id));
          const uniqueNewProfiles = newProfileEvents.filter(e => !existingIds.has(e.id));
          return [...prev, ...uniqueNewProfiles];
        });
        setContentEvents(prev => {
          const existingIds = new Set(prev.map(e => e.id));
          const uniqueNewContent = newContentEvents.filter(e => !existingIds.has(e.id));
          return [...prev, ...uniqueNewContent];
        });
      } else {
        setProfileEvents(newProfileEvents);
        setContentEvents(newContentEvents);
      }

      // Load comment counts in background after search results are displayed
      if (newContentEvents.length > 0) {
        // Don't await this - let it run in background
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
    profileEvents,
    contentEvents,
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
