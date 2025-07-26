import Colors from '@/core/env/Colors';
import { spacing } from '@/core/env/Spacing';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Text } from '@/lib/theme/Themed';
import { SearchResult } from '@/lib/types/search';
import { extractTitle, parseContent } from '@/lib/utils/contentParser';
import { Button, Divider, Icon, Overlay } from '@rneui/themed';
import { load, request } from '@welshman/net';
import { Filter } from '@welshman/util';
import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ContentResultActions } from './ContentResultActions';
import { ContentResultBody } from './ContentResultBody';
import { ContentResultHeader } from './ContentResultHeader';

interface ContentMiniProps {
  eventId: string;
  relays?: string[];
  raw?: string;
}

export const ContentMini: React.FC<ContentMiniProps> = ({
  eventId,
  relays = [],
  raw,
}) => {
  const { isDark } = useTheme();
  const colorScheme = isDark ? 'dark' : 'light';
  const colors = Colors[colorScheme];

  const [isLoading, setIsLoading] = useState(true);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    loadContent();
  }, [eventId]);

  const loadContent = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const presetPublicRelays = [
        'wss://relay.damus.io/',
        'wss://nos.lol/',
        'wss://search.nos.today/',
        'wss://relay.nostr.band/'
      ];

      // Combine content relays with preset public relays, removing duplicates
      const allRelays = [...new Set([...relays, ...presetPublicRelays])];

      console.log(`[CONTENT-MINI] Loading content for event: ${eventId.substring(0, 8)}...`);

      // Load the referenced event
      const contentFilter: Filter = {
        ids: [eventId],
      };

      let events: any[] = [];

      if (Platform.OS === 'web') {
        events = await load({
          filters: [contentFilter],
          relays: allRelays,
        });
      } else {
        events = await request({
          filters: [contentFilter],
          relays: allRelays,
          autoClose: true,
          threshold: 0.1,
        });
      }

      if (events && events.length > 0) {
        const event = events[0];
        const parsedContent = parseContent(event.content || '') || {
          text: event.content || '',
          urls: [],
          mediaUrls: [],
          websiteUrls: [],
          hashtags: []
        };

        // Create SearchResult format
        const result: SearchResult = {
          id: event.id,
          type: 'content',
          title: extractTitle(event.content || ''),
          description: event.content || '',
          metadata: {
            timestamp: event.created_at,
            author: event.pubkey.substring(0, 8) + '...',
            authorPubkey: event.pubkey,
          },
          event: event,
          relays: allRelays,
        };

        setSearchResult(result);
      } else {
        setError('Content not found');
      }
    } catch (err) {
      console.error('[CONTENT-MINI] Error loading content:', err);
      setError('Failed to load content');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePress = () => {
    if (searchResult) {
      setShowPopup(true);
    }
  };

  const ContentPopup = () => (
    <Overlay
      isVisible={showPopup}
      onBackdropPress={() => setShowPopup(false)}
      overlayStyle={[styles.overlay, { backgroundColor: colors.surface }]}
    >
      <View style={styles.overlayHeader}>
        <View style={styles.overlayAuthorInfo}>
          <ContentResultHeader result={searchResult!} />
        </View>
        <Button
          type="clear"
          icon={
            <Icon
              name="close"
              type="ionicon"
              size={24}
              color={colors.text}
            />
          }
          onPress={() => setShowPopup(false)}
          buttonStyle={styles.closeButton}
        />
      </View>

      <Divider />

      <ScrollView style={styles.overlayContent} showsVerticalScrollIndicator={false}>
        <ContentResultBody result={searchResult!} isInPopup={true} />
      </ScrollView>

      <Divider />

      <View style={styles.overlayActions}>
        <ContentResultActions
          result={searchResult!}
          showActions={true}
        />
      </View>
    </Overlay>
  );

  if (isLoading) {
    return (
      <TouchableOpacity style={styles.container} disabled>
        <View style={[styles.loadingContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.loadingText, { color: colors.placeholder }]}>
            Loading...
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (error || !searchResult) {
    return (
      <TouchableOpacity style={styles.container} disabled>
        <View style={[styles.errorContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error || 'Content not found'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.previewContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.previewContent}>
          <Text style={[styles.previewTitle, { color: colors.text }]} numberOfLines={1}>
            {searchResult.title || 'Embedded Content'}
          </Text>
          <Text style={[styles.previewAuthor, { color: colors.placeholder }]} numberOfLines={1}>
            by {searchResult.metadata.author}
          </Text>
        </View>
        <View style={styles.previewIcon}>
          <Text style={[styles.iconText, { color: colors.primary }]}>📄</Text>
        </View>
      </TouchableOpacity>

      <ContentPopup />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing(1),
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing(2),
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginVertical: spacing(1),
  },
  previewContent: {
    flex: 1,
    marginRight: spacing(2),
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  previewAuthor: {
    fontSize: 12,
  },
  previewIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  iconText: {
    fontSize: 12,
  },
  loadingContainer: {
    padding: spacing(2),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  loadingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  errorContainer: {
    padding: spacing(2),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,0,0,0.2)',
  },
  errorText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  // Overlay styles
  overlay: {
    width: '90%',
    maxHeight: '80%',
    minHeight: '60%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  overlayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing(4),
  },
  overlayAuthorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  overlayContent: {
    padding: spacing(4),
    flex: 1,
  },
  overlayActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing(4),
  },
});
