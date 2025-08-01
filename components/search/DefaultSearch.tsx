import { SearchInput } from '@/components/search/SearchInput';
import { SearchResultsList } from '@/components/search/SearchResultsList';
import { SearchTabs } from '@/components/search/SearchTabs';
import { useDefaultSearch } from '@/lib/hooks/useDefaultSearch';
import { useSearchResults } from '@/lib/hooks/useSearchResults';
import React from 'react';
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
      />

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
