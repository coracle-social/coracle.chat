import { ScrollToTop } from '@/components/generalUI/ScrollToTop';
import { DefaultSearch } from '@/components/search/DefaultSearch';
import { PreferenceSearch } from '@/components/search/PreferenceSearch';
import { SearchEngineType, SearchToggle } from '@/components/search/SearchToggle';
import { Layout } from '@/core/env/Layout';
import { useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';

export default function SearchScreen() {
  const [currentEngine, setCurrentEngine] = useState<SearchEngineType>('default');
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  const scrollViewRef = useRef<ScrollView | null>(null);

  const handleScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    setShowScrollToTop(contentOffset.y > 200);
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <View style={[
      styles.container,
      Platform.OS === 'web' && Layout.webContainer
    ]}>
      <View style={styles.mainLayout}>
        <View style={styles.searchInterface}>
          <SearchToggle
            currentEngine={currentEngine}
            onEngineChange={setCurrentEngine}
          />

          {currentEngine === 'default' ? (
            <DefaultSearch
              onScroll={handleScroll}
              scrollViewRef={scrollViewRef}
            />
          ) : (
            <PreferenceSearch
              onScroll={handleScroll}
              scrollViewRef={scrollViewRef}
            />
          )}
        </View>
      </View>

      <ScrollToTop
        visible={showScrollToTop}
        onPress={scrollToTop}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainLayout: {
    flexDirection: 'row',
    flex: 1,
  },
  searchInterface: {
    flex: 1,
    padding: 8,
  },
});
