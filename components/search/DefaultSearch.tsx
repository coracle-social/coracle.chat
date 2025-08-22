import { SearchInput } from '@/components/search/SearchInput';
import { SearchResultsList } from '@/components/search/SearchResultsList';
import { SearchTabs } from '@/components/search/SearchTabs';
import SearchTermHistory from '@/lib/components/SearchTermHistory';
import { useDefaultSearch } from '@/lib/hooks/useDefaultSearch';
import { useSearchResults } from '@/lib/hooks/useSearchResults';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';


interface DefaultSearchProps {
  onScroll?: (event: any) => void;
  scrollViewRef?: React.RefObject<any>;
}

export const DefaultSearch: React.FC<DefaultSearchProps> = ({
  onScroll,
  scrollViewRef,
}) => {
  const {
    searchTerm,
    profileEvents,
    contentEvents,
    isSearching,
    isLoadingMore,
    selectedFilters,
    selectedSort,
    setSearchTerm,
    setSelectedFilters,
    setSelectedSort,
    loadMoreResults,
  } = useDefaultSearch();

  // Track search history (up to 6 recent terms)
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Update search history only when search is completed (keyboard dismissed)
  const handleSearchBlur = () => {
    if (searchTerm && searchTerm.trim()) {
      const trimmedTerm = searchTerm.trim();

      // Don't add if it's already the most recent term
      if (searchHistory[0] !== trimmedTerm) {
        setSearchHistory(prev => {
          // Remove the term if it already exists (to avoid duplicates)
          const filtered = prev.filter(term => term !== trimmedTerm);
          // Add new term to the beginning and limit to 6 items
          return [trimmedTerm, ...filtered].slice(0, 6);
        });
      }
    }
  };

  const { searchResults } = useSearchResults(
    profileEvents,
    contentEvents,
    selectedFilters,
    selectedSort
  );

  // Handle filter/sort selection
  const handleFilterToggle = (filterId: string) => {
    if (['relevance', 'date', 'popularity', 'trust'].includes(filterId)) {
      // This is a sort option
      setSelectedSort(filterId);
    } else {
      // This is a filter option - only allow one filter at a time
      setSelectedFilters([filterId]);
    }
  };

  // Handle filter removal (only for filter options, not sort options)
  const handleFilterRemove = (filterId: string) => {
    if (!['relevance', 'date', 'popularity', 'trust'].includes(filterId)) {
      // Default to people if no filter is selected
      setSelectedFilters(['people']);
    }
  };

  // Check if sort option should be disabled
  const isSortDisabled = (filterId: string) => {
    // No sort options are disabled now that we have proper popularity sorting for profiles
    return false;
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;

    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      loadMoreResults();
    }

    onScroll?.(event);
  };

  return (
    <View style={styles.container}>
      <SearchInput
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder="Search people and content..."
        isSearching={isSearching}
        onClear={() => setSearchTerm('')}
        onBlur={handleSearchBlur}
      />

      <SearchTermHistory onTermSelect={setSearchTerm} previousSearchTerm={searchHistory} />

      <SearchTabs
        selectedFilters={selectedFilters}
        selectedSort={selectedSort}
        onFilterToggle={handleFilterToggle}
        onFilterRemove={handleFilterRemove}
        isSortDisabled={isSortDisabled}
      />

      <SearchResultsList
        searchTerm={searchTerm}
        searchResults={searchResults}
        isSearching={isSearching}
        isLoadingMore={isLoadingMore}
        onScroll={handleScroll}
        scrollViewRef={scrollViewRef}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
