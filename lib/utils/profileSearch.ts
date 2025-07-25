import { SearchResult } from '@/lib/types/search';
import { getFollowerCount, getFollowingCount, isFollowing } from '@/lib/utils/followUtils';
import {
  checkVerification,
  getRecentActivityTimestamp,
  loadActivityDataFromRelays,
  loadProfileFollowData
} from '@/lib/utils/profileLoadingUtility';
import {
  calculateProfileQualityScore,
  DEFAULT_QUALITY_THRESHOLDS,
  meetsProfileQualityThresholds
} from '@/lib/utils/searchQualityConfig';
import { searchProfiles } from '@welshman/app';
import { load, request } from '@welshman/net';
import { Router } from '@welshman/router';
import { Filter, PROFILE } from '@welshman/util';
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

  // Process all profiles from the paginated dataset
  paginatedProfiles.forEach((profile: any) => {
    combinedProfiles.set(profile.event.pubkey, {
      ...profile,
      _searchScore: 0.5, // Default score for all profiles
      _searchSource: 'store'
    });
  });

  let sortedProfiles = Array.from(combinedProfiles.values());

  console.log('[PROFILE-SEARCH] Loading follow data for', sortedProfiles.length, 'profiles');

  // Load follow data for top profiles (limit to avoid too many requests)
  const profilesToLoadFollowData = sortedProfiles.slice(0, Math.min(20, sortedProfiles.length));
  const followDataPromises = profilesToLoadFollowData.map(profile =>
    loadProfileFollowData(profile.event.pubkey)
  );

  try {
    await Promise.allSettled(followDataPromises);
    console.log('[PROFILE-SEARCH] Follow data loading completed');
  } catch (error) {
    console.warn('[PROFILE-SEARCH] Some follow data failed to load:', error);
  }

  //often ddes very little, increase restrictions??
  sortedProfiles = sortedProfiles.filter((profile: any) => {
    const verification = checkVerification(profile);
    const followerCount = getFollowerCount(profile.event.pubkey);
    const followingCount = getFollowingCount(profile.event.pubkey);
    const hasProfileInfo = profile.name || profile.display_name || profile.about;

    console.log(`[PROFILE-SEARCH] Profile ${profile.event.pubkey.substring(0, 8)}... - Followers: ${followerCount}, Following: ${followingCount}, Verified: ${verification.isVerified}`);

    return meetsProfileQualityThresholds(
      followerCount,
      followingCount,
      verification.isVerified,
      !!hasProfileInfo,
      DEFAULT_QUALITY_THRESHOLDS
    );
  });

  sortedProfiles = sortedProfiles.map((profile: any) => {
    const verification = checkVerification(profile);
    const followerCount = getFollowerCount(profile.event.pubkey);
    const followingCount = getFollowingCount(profile.event.pubkey);

    const qualityScore = calculateProfileQualityScore(
      followerCount,
      followingCount,
      verification.verificationScore,
      DEFAULT_QUALITY_THRESHOLDS
    );

    // Use quality score as the main score since we removed fuzzy search
    const combinedScore = qualityScore;

    return {
      ...profile,
      _searchScore: combinedScore,
      _qualityScore: qualityScore,
    };
  });

  // Sort by quality score (higher is better)
  sortedProfiles.sort((a: any, b: any) => (b._qualityScore || 0) - (a._qualityScore || 0));

  // Use the already paginated and processed profiles
  const profilesToProcess = sortedProfiles;

  for (const profile of profilesToProcess) {
    const verification = checkVerification(profile);
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
        verified: verification.isVerified,
        trustScore: verification.verificationScore,
        followerCount,
        followingCount,
        isFollowing: isUserFollowing,
        searchScore: profile._searchScore, // Include search score for debugging
        qualityScore: profile._qualityScore, // Include quality score for debugging
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
  if (profilePubkeys.length > 0) {
    loadActivityDataFromRelays(profilePubkeys).catch(error => {
      console.warn('[PROFILE-SEARCH] Background activity loading failed:', error);
    });
  }

  return {
    results: newProfileResults,
    newOffset
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

    console.log('[PROFILE-SEARCH] Loading profiles from relays:', relaysToUse);

    if (Platform.OS === 'web') {
      const profileLoad = await load({
        filters: [profileFilter],
        relays: relaysToUse,
      });
      console.log('[PROFILE-SEARCH] Profile load result:', profileLoad);
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
