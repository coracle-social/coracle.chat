import { LoadingStates } from '@/components/generalUI/LoadingStates';
import { SearchInput } from '@/components/search/SearchInput';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

interface PreferenceSearchProps {
  onScroll?: (event: any) => void;
  scrollViewRef?: React.RefObject<any>;
}

export const PreferenceSearch: React.FC<PreferenceSearchProps> = ({
  onScroll,
  scrollViewRef,
}) => {
  const { isDark } = useTheme();

  return (
    <View style={styles.container}>
      <SearchInput
        value=""
        onChangeText={() => {}}
        placeholder="Preference Search (Coming Soon)..."
        isSearching={false}
        onClear={() => {}}
      />

      <View style={styles.comingSoonContainer}>
        <Text style={[styles.comingSoonText, { color: isDark ? '#888' : '#666' }]}>
          Preference Search
        </Text>
        <Text style={[styles.comingSoonSubtext, { color: isDark ? '#666' : '#999' }]}>
          This feature will allow you to search using your personal relay preferences and social graph for more personalized results.
        </Text>
        <Text style={[styles.comingSoonSubtext, { color: isDark ? '#666' : '#999' }]}>
          Coming soon...
        </Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.resultsContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.resultsContent}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <LoadingStates type="empty" message="Preference Search will be available soon!" />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  comingSoonContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  comingSoonSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsContent: {
    padding: 16,
  },
});
