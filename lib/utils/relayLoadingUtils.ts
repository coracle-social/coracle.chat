import { load, request } from '@welshman/net';
import { Router } from '@welshman/router';
import { Platform } from 'react-native';

export interface RelayLoadingOptions {
  filters: any[];
  relays?: string[];
  autoClose?: boolean;
  threshold?: number;
  onEvent?: (event: any, url: string) => void;
  onEose?: (url: string) => void;
  onDisconnect?: (url: string) => void;
  useLoad?: boolean;
  useRequest?: boolean;
}

/**
 * Get relay URLs using merge
 */
export const getRelayUrls = (options: { preferSearch?: boolean; limit?: number } = {}): string[] => {
  const { preferSearch = true, limit = 8 } = options;

  return Router.get()
    .merge([
      preferSearch
        ? Router.get().Search().weight(0.8)
        : Router.get().Index().weight(0.8),
      preferSearch
        ? Router.get().Index().weight(0.2)
        : Router.get().Search().weight(0.2)
    ])
    .limit(limit)
    .getUrls();
};

/**
 * Unified relay loading function that handles platform differences
 */
export const loadFromRelays = async (options: RelayLoadingOptions): Promise<void> => {
  const {
    filters,
    relays,
    autoClose = true,
    threshold = 0.1,
    onEvent,
    onEose,
    onDisconnect,
    useLoad,
    useRequest
  } = options;

  const relayUrls = relays || getRelayUrls();

  // Determine loading strategy based on platform or explicit options
  const shouldUseLoad = useLoad !== undefined ? useLoad : Platform.OS === 'web';
  const shouldUseRequest = useRequest !== undefined ? useRequest : Platform.OS !== 'web';

  //this should be temporary until mobile is fixed
    if (shouldUseLoad) {
      await load({
        filters,
        relays: relayUrls,
      });
    } else if (shouldUseRequest) {
      await request({
        filters,
        relays: relayUrls,
        autoClose,
        threshold,
        onEvent,
        onEose,
        onDisconnect,
      });
    }
};

/**
 * Load content with reactions (common pattern in contentSearch)
 */
export const loadContent = async (
  contentFilter: any,
  options: {
    onContentEvent?: (event: any, url: string) => void;
  } = {}
): Promise<void> => {
  const relayUrls = getRelayUrls();
  await loadFromRelays({
    filters: [contentFilter],
    relays: relayUrls,
    onEvent: options.onContentEvent,
  });
};

export const loadCommentsForEvents = async (
  eventIds: string[],
  options: {
    onCommentEvent?: (event: any, url: string) => void;
  } = {}
): Promise<void> => {
  const commentFilters = eventIds.map(eventId => ({
    kinds: [1], // NOTE events
    '#e': [eventId],
  }));

  await loadFromRelays({
    filters: commentFilters,
    onEvent: options.onCommentEvent,
  });
};
export const loadProfileData = async (
  pubkeys: string[],
  options: {
    onProfileEvent?: (event: any, url: string) => void;
  } = {}
): Promise<void> => {
  const profileFilters = pubkeys.map(pubkey => ({
    kinds: [0], // PROFILE events
    authors: [pubkey],
  }));

  await loadFromRelays({
    filters: profileFilters,
    onEvent: options.onProfileEvent,
  });
};

/**
 * Load profiles from relays by search term
 */
export const loadProfilesBySearchTerm = async (
  searchTerm: string,
  options: {
    onProfileEvent?: (event: any, url: string) => void;
    limit?: number;
  } = {}
): Promise<void> => {
  const { onProfileEvent, limit = 50 } = options;

  const profileFilter = {
    kinds: [0], // PROFILE events
    search: searchTerm,
    limit,
  };

  await loadFromRelays({
    filters: [profileFilter],
    onEvent: onProfileEvent,
  });
};
