import { SearchResultCard } from '@/components/search/SearchResultCard';
import { Typography } from '@/core/env/Typography';
import { HStack } from '@/lib/components/HStack';
import { LoadingStates } from '@/lib/components/LoadingStates';
import { useStore } from '@/lib/stores/useWelshmanStore2';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { BareEvent } from '@/lib/types/search';
import { pubkey } from '@welshman/app';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from 'react';
import { Dimensions, FlatList, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { ProfileMini } from './ProfileMini';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

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
  const colors = useThemeColors();

  // Separate profiles and content
  const profiles = searchResults.filter(result => result.type === 'profile');
  const content = searchResults.filter(result => result.type === 'content');

  // Auto-detect mobile for horizontal layout
  const isMobile = Platform.OS !== 'web';

  // Responsive sizing for shimmer rectangles (same as ProfileMini)
  const screenWidth = Dimensions.get('window').width;
  const baselineWidth = 390; // iPhone 14 regular
  const scaleFactor = screenWidth / baselineWidth;
  const baseWidth = 120;
  const baseHeight = 100;
  const scaledWidth = Math.round(baseWidth * scaleFactor);
  const scaledHeight = Math.round(baseHeight * scaleFactor);

  const renderResult = (result: BareEvent) => {
    return (
      <SearchResultCard
        key={result.id}
        result={result}
      />
    );
  };

  const renderProfileMini = ({ item }: { item: BareEvent }) => {
    return (
      <View style={styles.horizontalProfileContainer}>
        <ProfileMini
          pubkey={item.authorPubkey!}
          raw={item.event.content || ''}
          vertical={true}
          result={item}
        />
      </View>
    );
  };

  const getEmptyMessage = () => {
    if (isPreferenceSearch && !currentPubkey) {
      return "You must be logged in to use preference search";
    }
    return `No results found for "${searchTerm}"`;
  };

  return (
    <View style={styles.container}>
      {/* Horizontal Profiles - Mobile Only */}
      {isMobile && searchTerm.length >= 2 && (
        <View style={styles.horizontalSection}>
          <Text style={[Typography.header, styles.sectionTitle, { color: colors.text }]}>People and Communities</Text>
          {profiles.length > 0 ? (
            <FlatList
              data={profiles}
              renderItem={renderProfileMini}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              snapToInterval={300} // Adjust based on ProfileMini width
              decelerationRate="normal"
              snapToAlignment="start"
              pagingEnabled={false}
              scrollEventThrottle={16}
              bounces={true}
              bouncesZoom={false}
            />
          ) : (
            <HStack spacing={12} style={styles.horizontalList}>
              {[1, 2, 3].map((index) => (
                <View key={index} style={[styles.horizontalProfileContainer, { width: scaledWidth }]}>
                  <ShimmerPlaceholder
                    visible={false}
                    width={scaledWidth}
                    height={scaledHeight}
                    style={[styles.shimmerProfile, { borderRadius: 12, height: scaledHeight }]}
                    shimmerColors={['#404040', '#2D2C2A', '#404040']}
                    duration={1500}
                    shimmerWidthPercent={0.8}
                    location={[0.3, 0.5, 0.7]}
                  />
                </View>
              ))}
            </HStack>
          )}
        </View>
      )}

        <ScrollView
          ref={scrollViewRef}
          style={styles.resultsContainer}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          {searchTerm.length < 2 ? (
            <LoadingStates type="empty" message="Start typing to search for people and content..." />
          ) : isSearching ? (
            <LoadingStates type="searching" />
          ) : (isMobile ? content : searchResults).length === 0 ? (
            <LoadingStates type="empty" message={getEmptyMessage()} />
          ) : (
            <>
              {(isMobile ? content : searchResults).map(renderResult)}
              {isLoadingMore && <LoadingStates type="loading-more" />}
            </>
          )}
        </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  horizontalSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  horizontalList: {
    paddingHorizontal: 16,
  },
  horizontalProfileContainer: {
    marginRight: 12,
    alignItems: 'center',
  },
  contentSection: {
    flex: 1,
  },
  resultsContainer: {
    flex: 1,
  },
  shimmerProfile: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
});
