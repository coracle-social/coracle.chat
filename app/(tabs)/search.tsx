import React, { useState, useMemo, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Text } from '@/lib/theme/Themed';
import { Layout } from '@/core/env/Layout';
import { spacing } from '@/core/env/Spacing';
import { useTheme } from '@/lib/theme/ThemeContext';
import Colors from '@/core/env/Colors';
import { useStore } from '@/stores/useWelshmanStore2';
import {
  profiles,
  profileSearch,
  searchProfiles,
  deriveProfile,
  loadProfile
} from '@welshman/app';
import { repository } from '@welshman/app';
import { load } from '@welshman/net';
import {
  NOTE,
  LONG_FORM,
  COMMENT,
  PROFILE,
  Filter
} from '@welshman/util';
import { Router } from '@welshman/router';

type SearchResult = {
  id: string;
  type: 'profile' | 'content';
  title: string;
  subtitle: string;
  pubkey?: string;
  content?: string;
  timestamp?: number;
};

export default function SearchScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'people' | 'content'>('all');

  const { isDark } = useTheme();
  const colorScheme = isDark ? 'dark' : 'light';
  const colors = Colors[colorScheme];

  // Get Welshman stores
  const profilesStore = useStore(profiles);
  const [profileSearchStore] = useStore(profileSearch);

  // Debug data state and load initial data
  useEffect(() => {
    console.log('🔍 Data state debug:');
    console.log('🔍 Profiles store:', profilesStore?.length || 0, 'profiles');
    console.log('🔍 Profile search options:', profileSearchStore?.options?.length || 0, 'options');
    console.log('🔍 Repository dump:', repository.dump().length, 'events');
    console.log('🔍 Router search relays:', Router.get().Search().getUrls());

    // Load some initial data if we don't have much
    if ((profilesStore?.length || 0) < 10) {
      console.log('🔍 Loading initial profiles...');
      load({
        filters: [{ kinds: [PROFILE], limit: 50 }],
        relays: Router.get().Index().getUrls(),
      });
    }

    if (repository.dump().length < 100) {
      console.log('🔍 Loading initial content...');
      load({
        filters: [{ kinds: [NOTE], limit: 100 }],
        relays: Router.get().Index().getUrls(),
      });
    }
  }, [profilesStore, profileSearchStore]);

  // Debounced search effect
  useEffect(() => {
    console.log('🔍 Search effect triggered:', { searchTerm, length: searchTerm.length });

    if (searchTerm.length < 2) {
      console.log('🔍 Search term too short, clearing results');
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    console.log('🔍 Setting search state and scheduling search...');
    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      performSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const performSearch = async (term: string) => {
    console.log('🔍 Starting search for term:', term);
    console.log('🔍 Active tab:', activeTab);
    console.log('🔍 Profile search store:', profileSearchStore);

    try {
      const results: SearchResult[] = [];

      // Search for profiles
      if (activeTab === 'all' || activeTab === 'people') {
        console.log('🔍 Searching for profiles...');
        const profileResults = profileSearchStore?.searchOptions(term) || [];
        console.log('🔍 Profile search results:', profileResults.length, profileResults);

        for (const profile of profileResults.slice(0, 10)) {
          console.log('🔍 Processing profile:', profile);
          results.push({
            id: profile.event.pubkey,
            type: 'profile',
            title: profile.name || profile.display_name || 'Anonymous',
            subtitle: profile.about || profile.nip05 || 'No description',
            pubkey: profile.event.pubkey,
            timestamp: profile.event.created_at,
          });
        }

        // Trigger network search for profiles
        console.log('🔍 Triggering network profile search...');
        searchProfiles(term);
      }

      // Search for content
      if (activeTab === 'all' || activeTab === 'content') {
        console.log('🔍 Searching for content...');
        const contentFilter: Filter = {
          kinds: [NOTE, LONG_FORM, COMMENT],
          search: term,
          limit: 20,
        };
        console.log('🔍 Content filter:', contentFilter);

        // Query local repository
        console.log('🔍 Querying local repository...');
        const localEvents = repository.query([contentFilter]);
        console.log('🔍 Local events found:', localEvents.length, localEvents);

        for (const event of localEvents.slice(0, 10)) {
          console.log('🔍 Processing event:', event.id, event.content.substring(0, 50));
          results.push({
            id: event.id,
            type: 'content',
            title: event.content.substring(0, 50) + (event.content.length > 50 ? '...' : ''),
            subtitle: `by ${event.pubkey.substring(0, 8)}...`,
            content: event.content,
            pubkey: event.pubkey,
            timestamp: event.created_at,
          });
        }

        // Load from search relays
        console.log('🔍 Loading from search relays...');
        const searchRelays = Router.get().Search().getUrls();
        const indexRelays = Router.get().Index().getUrls();
        const relaysToUse = searchRelays.length > 0 ? searchRelays : indexRelays;
        console.log('🔍 Search relays:', searchRelays);
        console.log('🔍 Using relays:', relaysToUse);
        load({
          filters: [contentFilter],
          relays: relaysToUse,
        });
      }

      console.log('🔍 Final results:', results.length, results);
      setSearchResults(results);
    } catch (error) {
      console.error('🔍 Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const renderSearchResult = (result: SearchResult) => (
    <TouchableOpacity
      key={result.id}
      style={[
        styles.resultItem,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }
      ]}
      onPress={() => {
        // Handle result selection
        console.log('Selected:', result);
      }}
    >
      <View style={styles.resultHeader}>
        <View style={styles.resultType}>
          <Text style={[styles.typeBadge, {
            backgroundColor: result.type === 'profile' ? colors.primary : colors.secondary
          }]}>
            {result.type === 'profile' ? '👤' : '📝'}
          </Text>
        </View>
        <View style={styles.resultContent}>
          <Text style={[styles.resultTitle, { color: colors.text }]} numberOfLines={2}>
            {result.title}
          </Text>
          <Text style={[styles.resultSubtitle, { color: colors.placeholder }]} numberOfLines={1}>
            {result.subtitle}
          </Text>
        </View>
        {result.timestamp && (
          <Text style={[styles.resultTime, { color: colors.placeholder }]}>
            {formatTimestamp(result.timestamp)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, Platform.OS === 'web' && Layout.webContainer]}>
      {/* Search Header */}
      <View style={[styles.searchHeader, { backgroundColor: colors.surface }]}>
        <View style={[styles.searchInputContainer, { backgroundColor: colors.surfaceVariant }]}>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search people and content..."
            placeholderTextColor={colors.placeholder}
            value={searchTerm}
            onChangeText={setSearchTerm}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {isSearching && (
            <View style={styles.searchingIndicator}>
              <Text style={{ color: colors.primary }}>🔍</Text>
            </View>
          )}
        </View>
      </View>

      {/* Search Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
        {(['all', 'people', 'content'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
          style={[
              styles.tab,
              activeTab === tab && {
                backgroundColor: colors.primary,
                borderColor: colors.primary
              }
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.tabText,
            {
                color: activeTab === tab ? colors.surface : colors.text
              }
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Results */}
      <ScrollView
        style={styles.resultsContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.resultsContent}
      >
        {searchTerm.length < 2 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.placeholder }]}>
              Start typing to search for people and content...
            </Text>
          </View>
        ) : isSearching ? (
          <View style={styles.loadingState}>
            <Text style={[styles.loadingText, { color: colors.placeholder }]}>
              Searching...
            </Text>
          </View>
        ) : searchResults.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.placeholder }]}>
              No results found for "{searchTerm}"
            </Text>
          </View>
        ) : (
          <>
            <Text style={[styles.resultsCount, { color: colors.placeholder }]}>
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
            </Text>
            {searchResults.map(renderSearchResult)}
          </>
        )}
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchHeader: {
    padding: spacing(4),
    paddingBottom: spacing(2),
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: spacing(1),
  },
  searchingIndicator: {
    marginLeft: spacing(2),
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing(4),
    paddingBottom: spacing(2),
    gap: spacing(2),
  },
  tab: {
    flex: 1,
    paddingVertical: spacing(2),
    paddingHorizontal: spacing(3),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsContent: {
    padding: spacing(4),
  },
  resultsCount: {
    fontSize: 14,
    marginBottom: spacing(3),
  },
  resultItem: {
    marginBottom: spacing(3),
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing(3),
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  resultType: {
    marginRight: spacing(3),
  },
  typeBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing(1),
  },
  resultSubtitle: {
    fontSize: 14,
  },
  resultTime: {
    fontSize: 12,
    marginLeft: spacing(2),
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing(8),
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing(8),
  },
  loadingText: {
    fontSize: 16,
  },
});
