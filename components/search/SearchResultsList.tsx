import { LoadingStates } from '@/components/generalUI/LoadingStates';
import { ContentResultCard } from '@/components/search/ContentResultCard';
import { ProfileResultCard } from '@/components/search/ProfileResultCard';
import { SearchResult } from '@/lib/types/search';
import React, { useRef } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

interface SearchResultsListProps {
  searchTerm: string;
  searchResults: SearchResult[];
  isSearching: boolean;
  isLoadingMore: boolean;
  onScroll?: (event: any) => void;
  scrollViewRef?: React.RefObject<ScrollView | null>;
}

export const SearchResultsList: React.FC<SearchResultsListProps> = ({
  searchTerm,
  searchResults,
  isSearching,
  isLoadingMore,
  onScroll,
  scrollViewRef: externalScrollViewRef,
}) => {
  const internalScrollViewRef = useRef<ScrollView>(null);
  const scrollViewRef = externalScrollViewRef || internalScrollViewRef;

  const renderResult = (result: SearchResult) => {
    if (result.type === 'profile') {
      return (
        <ProfileResultCard
          key={result.id}
          result={result}
        />
      );
    } else {
      return (
        <ContentResultCard
          key={result.id}
          result={result}
        />
      );
    }
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
        <LoadingStates type="empty" message={`No results found for "${searchTerm}"`} />
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
