import { DefaultSearch } from '@/components/search/DefaultSearch';
import { PreferenceSearch } from '@/components/search/PreferenceSearch';
import { SearchSidebar } from '@/components/search/SearchSidebar';
import { SearchSidebarToggle } from '@/components/search/SearchSidebarToggle';
import { SearchEngineType, SearchToggle } from '@/components/search/SearchToggle';
import { Layout } from '@/core/env/Layout';
import { ScrollToTop } from '@/lib/components/ScrollToTop';
import SearchOptionsFAB from '@/lib/components/SearchOptionsFAB';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';

export default function SearchScreen() {
  const [currentEngine, setCurrentEngine] = useState<SearchEngineType>('default');
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(0);
  const colors = useThemeColors();

  const defaultSearchRef = useRef<ScrollView | null>(null);
  const preferenceSearchRef = useRef<ScrollView | null>(null);

  const handleScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    setShowScrollToTop(contentOffset.y > 200);
  };

  const scrollToTop = () => {
    const activeRef = currentEngine === 'default' ? defaultSearchRef : preferenceSearchRef;
    if (activeRef.current) {
      activeRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarOptionChange = (option: string, value: any) => {
    console.log('Sidebar option changed:', option, value);
    // Handle sidebar option changes here
  };

  const handleSidebarWidthChange = (width: number) => {
    setSidebarWidth(width);
  };

  return (
  <View style={{ flex: 1 }}>
    {/* Web-only sidebar outside container */}
    {Platform.OS === 'web' && (
      <>
        <SearchSidebar
          isOpen={isSidebarOpen}
          onOptionChange={handleSidebarOptionChange}
          onWidthChange={handleSidebarWidthChange}
        />
        <SearchSidebarToggle
          isOpen={isSidebarOpen}
          onPress={handleSidebarToggle}
          sidebarWidth={sidebarWidth}
        />
      </>
    )}

    <View style={[
      styles.container,
      Platform.OS === 'web' && Layout.webContainer,
      { backgroundColor: colors.background }
    ]}>
      <View style={styles.mainLayout}>

        <View style={styles.searchInterface}>
          <SearchToggle
            currentEngine={currentEngine}
            onEngineChange={setCurrentEngine}
          />

          {/* Keep both components mounted to persist data */}
          <View style={[styles.searchContainer, { display: currentEngine === 'default' ? 'flex' : 'none' }]}>
            <DefaultSearch
              onScroll={handleScroll}
              scrollViewRef={defaultSearchRef}
            />
          </View>

          <View style={[styles.searchContainer, { display: currentEngine === 'preference' ? 'flex' : 'none' }]}>
            <PreferenceSearch
              onScroll={handleScroll}
              scrollViewRef={preferenceSearchRef}
            />
          </View>
        </View>
      </View>

      <ScrollToTop
        visible={showScrollToTop}
        onPress={scrollToTop}
      />

      {/* Mobile-only Search Options FAB */}
      {Platform.OS !== 'web' && <SearchOptionsFAB />}
    </View>
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative', // Ensure absolute positioning works correctly
  },
  mainLayout: {
    flex: 1,
  },
  searchInterface: {
    flex: 1,
    padding: 8,
  },
  searchContainer: {
    flex: 1,
  },
});
