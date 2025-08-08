import { RelayItem } from '@/components/search/RelayItem';
import { SearchInput } from '@/components/search/SearchInput';
import { useStore } from '@/lib/stores/useWelshmanStore2';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text, View } from '@/lib/theme/Themed';
import { loadRelay, relaySearch, repository } from '@welshman/app';
import { request } from '@welshman/net';
import { Router } from '@welshman/router';
import { RELAYS } from '@welshman/util';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';
import { Card } from 'react-native-paper';

// Network relay discovery function
const discoverRelaysFromNetwork = async () => {
  try {
    // Check local repository first
    const localEvents = repository.query([{ kinds: [RELAYS] }]);

    // If local repo is empty, query network
    if (localEvents.length === 0) {
      const indexerRelays = Router.get().Index().getUrls();
      await request({
        filters: [{ kinds: [RELAYS] }],
        relays: indexerRelays,
        autoClose: true
      });
    } else {
      // don't await the query
      const indexerRelays = Router.get().Index().getUrls();
      request({
        filters: [{ kinds: [RELAYS] }],
        relays: indexerRelays,
        autoClose: true
      }).catch(console.error);
    }

    // Extract relay URLs from repository
    const discoveredRelays = new Set<string>();
    repository.query([{ kinds: [RELAYS] }]).forEach(event => {
      event.tags.filter(tag => tag[0] === 'r').forEach(tag => {
        if (tag[1]) {
          discoveredRelays.add(tag[1]);
          loadRelay(tag[1]);
        }
      });
    });

    return Array.from(discoveredRelays);
  } catch (error) {
    console.error('Error discovering relays:', error);
    return [];
  }
};

interface RelaySearchProps {
  onAddOutbox: (url: string) => void;
  onAddInbox: (url: string) => void;
}

export const RelaySearch: React.FC<RelaySearchProps> = ({ onAddOutbox, onAddInbox }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchResults] = useStore(relaySearch);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const colors = useThemeColors();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Search for relays using the debounced search term
  const results = useMemo(() => {
    return searchResults?.searchOptions?.(debouncedSearchTerm) || [];
  }, [searchResults, debouncedSearchTerm]);

  // Run discovery once on mount
  useEffect(() => {
    const discoverRelays = async () => {
      setIsDiscovering(true);
      await discoverRelaysFromNetwork();
      setIsDiscovering(false);
    };

    discoverRelays();
  }, []);

  return (
    <View style={{ paddingHorizontal: 16}}>
      <Card style={{ marginVertical: 8 }}>
        <Card.Content>
          <SearchInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search for new relays..."
            onClear={() => setSearchTerm('')}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />

          {searchTerm.length > 0 && (
            <View style={{
              marginTop: 8
            }}>
              {results.length > 0 ? (
                <ScrollView
                  style={{ maxHeight: 150 }}
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                >
                  {results.map((relay: any) => (
                    <RelayItem
                      key={relay.url}
                      relay={relay}
                      isSearchMode={true}
                      onAddOutbox={() => onAddOutbox(relay.url)}
                      onAddInbox={() => onAddInbox(relay.url)}
                    />
                  ))}
                </ScrollView>
              ) : (
                <Text style={{ color: colors.text, textAlign: 'center', padding: 16 }}>
                  No relays found matching "{searchTerm}"
                </Text>
              )}
            </View>
          )}

          {/* Show spinning indicator when discovering */}
          {isDiscovering && isSearchFocused && (
            <View style={{ marginTop: 8, alignItems: 'center' }}>
              <ActivityIndicator
                size="small"
                color={colors.primary}
                style={{ marginBottom: 8 }}
              />
            </View>
          )}
        </Card.Content>
      </Card>
    </View>
  );
};
