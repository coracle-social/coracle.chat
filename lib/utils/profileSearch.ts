import { SearchResult } from '@/lib/types/search';
import { getFollowerCount, getFollowingCount, isFollowing } from '@/lib/utils/followUtils';
import {
  getProfileData,
  getRecentActivityTimestamp,
  loadActivityDataFromRelays,
  loadProfileFollowData
} from '@/lib/utils/profileLoadingUtility';
import {
  calculateProfileQualityScore,
  DEFAULT_QUALITY_THRESHOLDS,
  meetsProfileQualityThresholds
} from '@/lib/utils/searchQualityConfig';
import { loadProfile, repository, searchProfiles } from '@welshman/app';
import { load, request } from '@welshman/net';
import { Router } from '@welshman/router';
import { Filter, PROFILE } from '@welshman/util';
import { decode } from "nostr-tools/nip19";
import { Platform } from 'react-native';

export interface ProfileSearchOptions {
  term: string;
  isLoadMore?: boolean;
  offset?: number;
  limit?: number;
  profileSearchStore?: any;
}

export interface ProfileSearchResult {
  results: SearchResult[];
  newOffset: number;
}

/**
 * Search for a profile by direct link (npub/nprofile) or pubkey
 * Supports formats like:
 * - npub1abc123...
 * - raw hex pubkey
 *
 * Unsupported:
 * - nostr:npub1abc123... (not working, future for deeplinks)
 * - nostr:nprofile1abc123... same ^
 * - nprofile1abc123... not implemented yet
 *
 */
export const searchProfileByLink = async (input: string): Promise<SearchResult | null> => {
  try {
    let pubkey: string;
    let relays: string[] = [];

    // Clean the input
    const cleanInput = input.trim();

    // Check if it's a Nostr URI
    if (cleanInput.startsWith('npub') || cleanInput.startsWith('nostr:')) {
      try {
        // Handle different input formats
        let bech32: string;
        if (cleanInput.startsWith('nostr:')) {
          bech32 = cleanInput.replace('nostr:', '');
        } else if (cleanInput.startsWith('npub')) {
          bech32 = cleanInput;
        } else {
          throw new Error('Invalid Nostr URI format');
        }

        const { type, data } = decode(bech32);

        if (type === 'npub') {
          pubkey = data as string;
        } else {
          throw new Error('Invalid Nostr URI type');
        }
      } catch (error) {
        console.error('[PROFILE-SEARCH] Error decoding Nostr URI:', error);
        return null;
      }
    } else {
      // Assume it's a raw hex pubkey
      if (!/^[0-9a-fA-F]{64}$/.test(cleanInput)) {
        console.error('[PROFILE-SEARCH] Invalid pubkey format');
        return null;
      }
      pubkey = cleanInput;
    }

    await loadProfile(pubkey, relays);

    // Get the profile from repository
    const profileFilter = { kinds: [0], authors: [pubkey] };
    const localEvents = repository.query([profileFilter]);

    if (localEvents.length === 0) {
      console.warn('[PROFILE-SEARCH] Profile not found:', pubkey.substring(0, 8) + '...');
      return null;
    }

    const event = localEvents[0];
    const profile = JSON.parse(event.content || '{}');

    const profileDataResult = await getProfileData(pubkey, profile);

    // Convert to SearchResult format,
    return {
      id: `profile-${event.pubkey}`,
      type: 'profile',
      metadata: {
        timestamp: event.created_at,
        author: profile.name || profile.display_name,
        authorPubkey: event.pubkey,
        followerCount: profileDataResult.followerCount,
        followingCount: profileDataResult.followingCount,
        isFollowing: profileDataResult.isUserFollowing,
        recentActivityTimestamp: profileDataResult.recentActivityTimestamp || undefined,
      },
      event: {
        id: event.id,
        pubkey: event.pubkey,
        created_at: event.created_at,
        kind: event.kind,
        tags: event.tags,
        content: event.content,
        sig: event.sig,
        name: profile.name || '',
        display_name: profile.display_name || '',
        picture: profile.picture || '',
        about: profile.about || '',
        website: profile.website || '',
        lud06: profile.lud06 || '',
        lud16: profile.lud16 || '',
        nip05: profile.nip05 || '',
        banner: profile.banner || '',
        cover_image: profile.cover_image || '',
        cover: profile.cover || '',
        header_image: profile.header_image || '',
      },
      description: profile.about || '',
      imageUrl: profile.picture || '',
    };
  } catch (error) {
    console.error('[PROFILE-SEARCH] Error searching profile by link:', error);
    return null;
  }
};

/**
 * Simple function to check if input looks like a profile link
 */
export const isProfileLink = (input: string): boolean => {
  const cleanInput = input.trim();

  return (
    cleanInput.startsWith('npub') ||
    cleanInput.startsWith('nostr:') ||
    /^[0-9a-fA-F]{64}$/.test(cleanInput)
  );
};

/**
 * Search profiles with weighted field scoring and quality filtering
 */
export const searchProfilesWithWeighting = async (options: ProfileSearchOptions): Promise<ProfileSearchResult> => {
  const { term, isLoadMore = false, offset = 0, limit = 50, profileSearchStore } = options;

  const newProfileResults: SearchResult[] = [];

  const profileSearchResults = profileSearchStore?.searchOptions(term) || [];

  // Apply pagination directly to the original dataset
  const startIndex = isLoadMore ? offset : 0;
  const endIndex = startIndex + limit;
  const paginatedProfiles = profileSearchResults.slice(startIndex, endIndex);

  const combinedProfiles = new Map();

  paginatedProfiles.forEach((profile: any) => {
    combinedProfiles.set(profile.event.pubkey, {
      ...profile,
      _searchScore: 0.5,
      _searchSource: 'store'
    });
  });

  let sortedProfiles = Array.from(combinedProfiles.values());

  // Load follow data for top profiles (limit to avoid too many requests)
  //TODO lazy load more after user sees initial batch, and move the value to a config.
  const profilesToLoadFollowData = sortedProfiles.slice(0, Math.min(20, sortedProfiles.length));
  const followDataPromises = profilesToLoadFollowData.map(profile =>
    loadProfileFollowData(profile.event.pubkey)
  );

  try {
    await Promise.allSettled(followDataPromises);
  } catch (error) {
    console.warn('[PROFILE-SEARCH] Some follow data failed to load:', error);
  }

  //often ddes very little, increase restrictions??
  sortedProfiles = sortedProfiles.filter((profile: any) => {
    const hasProfileInfo = profile.name || profile.display_name || profile.about;

    return meetsProfileQualityThresholds(
      profile.followerCount,
      profile.followingCount,
      profile.isVerified,
      !!hasProfileInfo,
      DEFAULT_QUALITY_THRESHOLDS
    );
  });

  sortedProfiles = sortedProfiles.map((profile: any) => {
    const qualityScore = calculateProfileQualityScore(
      profile.followerCount,
      profile.followingCount,
      profile.verificationScore,
      DEFAULT_QUALITY_THRESHOLDS
    );

    //probably where fuzzy scoree would go
    const combinedScore = qualityScore;

    return {
      ...profile,
      _searchScore: combinedScore,
      _qualityScore: qualityScore,
    };
  });

  // Sort by quality score (higher is better)
  sortedProfiles.sort((a: any, b: any) => (b._qualityScore || 0) - (a._qualityScore || 0));

  const profilesToProcess = sortedProfiles;

  for (const profile of profilesToProcess) {
    const followerCount = getFollowerCount(profile.event.pubkey);
    const followingCount = getFollowingCount(profile.event.pubkey);
    const isUserFollowing = isFollowing(profile.event.pubkey);

    // Get recent activity timestamp (don't await to avoid blocking)
    const recentActivityPromise = getRecentActivityTimestamp(profile.event.pubkey);

    newProfileResults.push({
      id: `profile-${profile.event.pubkey}`,
      type: 'profile',
      metadata: {
        timestamp: profile.event.created_at,
        author: profile.name || profile.display_name,
        authorPubkey: profile.event.pubkey,
        verified: profile.isVerified,
        followerCount,
        followingCount,
        isFollowing: isUserFollowing,
        searchScore: profile._searchScore, //debugging
        qualityScore: profile._qualityScore, //debugging
      },
      event: profile,
    });

    // Update recent activity timestamp when available
    recentActivityPromise.then(recentActivityTimestamp => {
      if (recentActivityTimestamp) {
        const resultIndex = newProfileResults.findIndex(r => r.id === `profile-${profile.event.pubkey}`);
        if (resultIndex !== -1) {
          newProfileResults[resultIndex].metadata.recentActivityTimestamp = recentActivityTimestamp;
        }
      }
    }).catch(error => {
      console.warn('[PROFILE-SEARCH] Failed to get recent activity for profile:', profile.event.pubkey, error);
    });
  }

  const newOffset = isLoadMore ? offset + limit : limit;

  await loadProfilesFromRelays(term);

  const profilePubkeys = newProfileResults.map(result => result.metadata.authorPubkey).filter((pubkey): pubkey is string => Boolean(pubkey));

  // Load activity data in background
  if (profilePubkeys.length > 0) {
    loadActivityDataFromRelays(profilePubkeys).catch(error => {
      console.warn('[PROFILE-SEARCH] Background activity loading failed:', error);
    });
  }

  return {
    results: newProfileResults,
    newOffset,
  };
};

/**
 * Load profiles from relays in the background
 */
export const loadProfilesFromRelays = async (term: string) => {
  try {
    // Trigger search profiles
    searchProfiles(term);

    // Also try direct repository query for profiles
    const profileFilter: Filter = {
      kinds: [PROFILE],
      search: term,
      limit: 50,
    };

    // Load profiles from relays
    const searchRelays = Router.get().Search().getUrls();
    const indexRelays = Router.get().Index().getUrls();
    const relaysToUse = searchRelays.length > 0 ? searchRelays : indexRelays;

    if (Platform.OS === 'web') {
      const profileLoad = await load({
        filters: [profileFilter],
        relays: relaysToUse,
      });
    } else {
      //eventually remove this, loading still hangs on mobile(see profilemini loads)
      const _ = await request({
        filters: [profileFilter],
        relays: relaysToUse,
        autoClose: true,
        threshold: 0.1,
        onEvent: (event, url) => {
          // console.log(`Profile event from ${url}:`, event.id)
        },
        onEose: (url) => {
          //console.log(`EOSE from ${url}`)
        },
        onDisconnect: (url) => {
          //console.log(`Disconnected from ${url}`)
        }
      });
      // console.log('[PROFILE-SEARCH] Profile request result:', events);
    }
  } catch (error) {
    console.error('[PROFILE-SEARCH] Error loading profiles from relays:', error);
  }
};
