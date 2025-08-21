import { SearchInput } from '@/components/search/SearchInput';
import { SearchResultsList } from '@/components/search/SearchResultsList';
import { WotSearchFilters } from '@/components/search/WotSearchFilters';
import { useWotSearch } from '@/lib/hooks/useWotSearch';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface PreferenceSearchProps {
  onScroll?: (event: any) => void;
  scrollViewRef?: React.RefObject<any>;
}

export const PreferenceSearch: React.FC<PreferenceSearchProps> = ({
  onScroll,
  scrollViewRef,
}) => {
  const {
    searchTerm,
    setSearchTerm,
    results,
    loading,
    wotOptions,
    setWotOptions
  } = useWotSearch();

  return (
    <View style={styles.container}>
      <SearchInput
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder="Search your trusted network..."
        isSearching={loading}
        onClear={() => setSearchTerm('')}
      />

      <WotSearchFilters
        options={wotOptions}
        onOptionsChange={setWotOptions}
      />

      <SearchResultsList
        searchTerm={searchTerm}
        searchResults={results}
        isSearching={loading}
        isLoadingMore={false}
        onScroll={onScroll}
        scrollViewRef={scrollViewRef}
        isPreferenceSearch={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
