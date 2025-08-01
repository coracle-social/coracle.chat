import { SearchResultCard } from '@/components/search/SearchResultCard';
import { LoadingStates } from '@/lib/components/LoadingStates';
import { useStore } from '@/lib/stores/useWelshmanStore2';
import { BareEvent } from '@/lib/types/search';
import { pubkey } from '@welshman/app';
import React, { useRef } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

interface SearchResultsListProps {
  searchTerm: string;
  searchResults: BareEvent[];
  isSearching: boolean;
  isLoadingMore: boolean;
  onScroll?: (event: any) => void;
  scrollViewRef?: React.RefObject<ScrollView | null>;
  isPreferenceSearch?: boolean;
}

export const SearchResultsList: React.FC<SearchResultsListProps> = ({
  searchTerm,
  searchResults,
  isSearching,
  isLoadingMore,
  onScroll,
  scrollViewRef: externalScrollViewRef,
  isPreferenceSearch = false,
}) => {
  const internalScrollViewRef = useRef<ScrollView>(null);
  const scrollViewRef = externalScrollViewRef || internalScrollViewRef;
  const [currentPubkey] = useStore(pubkey);

  const renderResult = (result: BareEvent) => {
    return (
      <SearchResultCard
        key={result.id}
        result={result}
      />
    );
  };

  const getEmptyMessage = () => {
    if (isPreferenceSearch && !currentPubkey) {
      return "You must be logged in to use preference search";
    }
    return `No results found for "${searchTerm}"`;
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.resultsContainer}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.resultsContent}
      onScroll={onScroll}
      scrollEventThrottle={16}
    >
      {searchTerm.length < 2 ? (
        <LoadingStates type="empty" message="Start typing to search for people and content..." />
      ) : isSearching ? (
        <LoadingStates type="searching" />
      ) : searchResults.length === 0 ? (
        <LoadingStates type="empty" message={getEmptyMessage()} />
      ) : (
        <>
          {searchResults.map(renderResult)}
          {isLoadingMore && <LoadingStates type="loading-more" />}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  resultsContainer: {
    flex: 1,
  },
  resultsContent: {
    padding: 16,
  },
});
