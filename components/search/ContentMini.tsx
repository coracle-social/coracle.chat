import { LayoutPresets } from '@/core/env/LayoutPresets';
import { PUBLIC_RELAYS } from '@/core/env/MetaConfig';
import { spacing } from '@/core/env/Spacing';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { BareEvent } from '@/lib/types/search';
import { extractTitle } from '@/lib/utils/contentParser';
import { createConversationUrl } from '@/lib/utils/nip19Utils';
import { withBorderRadius, withShadow } from '@/lib/utils/styleUtils';
import { Card, Icon } from '@rneui/themed';
import { repository } from '@welshman/app';
import { load } from '@welshman/net';
import { Filter } from '@welshman/util';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ProfileMini } from './ProfileMini';

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
  const colors = useThemeColors();

  const [searchResult, setSearchResult] = useState<BareEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadContent();
  }, [eventId]);

  const loadContent = async () => {
    try {
      //the profilemini within the contentmini provides an adequate
        //shimmer effect while loading
      setError(null);

      console.log(`[CONTENT-MINI] Loading content for event: ${eventId.substring(0, 8)}...`);

      // First, check if the event is already in the repository
      const contentFilter: Filter = {
        ids: [eventId],
      };

      let events = repository.query([contentFilter]);
      console.log(`[CONTENT-MINI] Found ${events.length} events in repository`);

      if (events.length === 0) {
        // Not in repository, try loading from relays
        const presetPublicRelays = PUBLIC_RELAYS.slice(0, 8);
        const allRelays = [...new Set([...relays, ...presetPublicRelays])];
        const relayUrls = allRelays.slice(0, 10);

        console.log(`[CONTENT-MINI] Loading from ${relayUrls.length} relays:`, relayUrls);

          await load({
            filters: [contentFilter],
            relays: relayUrls,
          });

          // Check repository again after loading from relays
          events = repository.query([contentFilter]);
          console.log(`[CONTENT-MINI] Found ${events.length} events after relay load`);
      }

      if (events.length === 0) {
        throw new Error('Failed to load content from repository or relays');
      }

      const event = events[0];

      const result: BareEvent = {
        id: `content-${event.id}`,
        type: 'content',
        event: event,
        authorPubkey: event.pubkey,
      };

      setSearchResult(result);
      console.log(`[CONTENT-MINI] Content loaded successfully:`, event.id);
    } catch (error) { //sets error state for UI
      console.error('[CONTENT-MINI] Error loading content:', error);
      setError(error instanceof Error ? error.message : 'Failed to load content');
    }
  };

  const handleCardPress = () => {
    if (searchResult) {
      const conversationUrl = createConversationUrl(searchResult.event.id, relays);
      router.push(conversationUrl as any);
    }
  };

  if (error || !searchResult) {
    return (
      <Card containerStyle={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.errorContainer}>
          <Icon
            name="alert-circle-outline"
            type="ionicon"
            size={24}
            color={colors.error}
          />
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error || 'Failed to load content'}
          </Text>
        </View>
      </Card>
    );
  }

  // Extract title from content
  const content = searchResult.event.content || '';
  const title = extractTitle(content);

  // Compact inline mode only
  return (
    <TouchableOpacity
      style={[styles.inlineContainer, { backgroundColor: colors.surface }]}
      onPress={handleCardPress}
      activeOpacity={0.7}
    >
      <View style={styles.inlineContent}>
        <Text style={[styles.inlineTitle, { color: colors.text }]} numberOfLines={1}>
          {title || 'Content'}
        </Text>
        <View style={styles.authorRow}>
          {searchResult.authorPubkey && (
            <ProfileMini
              pubkey={searchResult.authorPubkey}
              raw={searchResult.authorPubkey}
              relays={relays}
              inline={true}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: spacing(1),
    ...withBorderRadius('sm'),
    ...withShadow('small'),
  },
  inlineContainer: {
    marginVertical: spacing(0.25),
    ...withBorderRadius('xs'),
    shadowOpacity: 0.02,
    shadowRadius: 1,
  },
  errorContainer: {
    ...LayoutPresets.row,
    alignItems: 'center',
    padding: spacing(2),
  },
  errorText: {
    fontSize: 14,
    marginLeft: spacing(1),
  },
  inlineContent: {
    flex: 1,
    marginRight: spacing(1),
  },
  inlineTitle: {
    fontSize: 14,
    fontWeight: '600',
    maxWidth: 200,
    marginBottom: spacing(0.5),
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 50,
  },
});
