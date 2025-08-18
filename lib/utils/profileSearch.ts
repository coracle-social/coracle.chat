import {
  DEFAULT_QUALITY_THRESHOLDS
} from '@/core/env/searchQualityConfig';
import { BareEvent, ProfileSearchOptions, ProfileSearchResult } from '@/lib/types/search';
import { getFollowerCount, getFollowingCount, isFollowing } from '@/lib/utils/followUtils';
import {
  getProfileData,
  loadProfileFollowData
} from '@/lib/utils/profileLoadingUtility';
import { loadProfile, repository } from '@welshman/app';
import { fromNostrURI } from '@welshman/util';
import { decode } from "nostr-tools/nip19";
import { loadProfilesBySearchTerm } from './relayLoadingUtils';


export const searchProfileByLink = async (input: string): Promise<BareEvent | null> => {
  try {
    let pubkey: string;
    let relays: string[] = [];

    const cleanInput = input.trim();

    // Check if it's a Nostr URI
    if (cleanInput.startsWith('npub') || cleanInput.startsWith('nostr:')) {
      try {
        const bech32 = fromNostrURI(cleanInput);

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

    // Convert to BareEvent format
    return {
      id: `profile-${event.pubkey}`,
      type: 'profile',
      event: {
        ...event,
        ...profile, // Merge profile data into event
      },
      authorPubkey: event.pubkey,
      verified: false, //only exists for wot search
      followerCount: profileDataResult.followerCount,
      followingCount: profileDataResult.followingCount,
      isFollowing: profileDataResult.isUserFollowing, // Fixed property name
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

  const profileSearchResults = profileSearchStore?.searchOptions(term) || [];

  // Apply pagination directly to the original dataset
  const startIndex = isLoadMore ? offset : 0;
  const endIndex = startIndex + limit;
  const profilesToProcess = profileSearchResults.slice(startIndex, endIndex);

  // Load follow data for top profiles (limit to avoid too many requests)
  const profilesToLoadFollowData = profilesToProcess.slice(0, Math.min(20, profilesToProcess.length));
  const followDataPromises = profilesToLoadFollowData.map((profile: any) =>
    loadProfileFollowData(profile.event.pubkey)
  );

  await Promise.allSettled(followDataPromises);

  // Single pass: filter, score, and create results
  const results = await Promise.all(
    profilesToProcess.map(async (profile: any) => {
      const pubkey = profile.event.pubkey;

      // Inline quality threshold check
      const hasProfileInfo = profile.name || profile.display_name || profile.about;
      const hasMinimalFollowers = (profile.followerCount || 0) >= DEFAULT_QUALITY_THRESHOLDS.minFollowers;
      const hasMinimalFollowing = (profile.followingCount || 0) >= DEFAULT_QUALITY_THRESHOLDS.minFollowing;
      const isVerified = profile.isVerified;
      const hasValidProfileInfo = !DEFAULT_QUALITY_THRESHOLDS.minProfileInfo || hasProfileInfo;

      const meetsQualityThresholds = (hasMinimalFollowers && hasMinimalFollowing) || isVerified || hasValidProfileInfo;

      if (!meetsQualityThresholds) return null;

      // Inline quality score calculation
      const followerCount = profile.followerCount || 0;
      const followingCount = profile.followingCount || 0;
      const verificationScore = profile.verificationScore || 0;

      const qualityScore = Math.min(
        (followerCount / 1000) * DEFAULT_QUALITY_THRESHOLDS.followerWeight +
        (followingCount / 500) * DEFAULT_QUALITY_THRESHOLDS.followingWeight +
        (verificationScore / 2) * DEFAULT_QUALITY_THRESHOLDS.verificationWeight,
        1.0
      );

      // Get follow data using the same utilities as WOT search
      const actualFollowerCount = getFollowerCount(pubkey);
      const actualFollowingCount = getFollowingCount(pubkey);
      const isUserFollowing = isFollowing(pubkey);

      return {
        id: `profile-${pubkey}`,
        type: 'profile',
        event: profile,
        authorPubkey: pubkey,
        verified: profile.isVerified,
        followerCount: actualFollowerCount,
        followingCount: actualFollowingCount,
        isFollowing: isUserFollowing,
        _qualityScore: qualityScore,
      };
    })
  );

  // Filter out null results and sort by quality score
  const validResults = results
    .filter(Boolean)
    .sort((a, b) => (b._qualityScore || 0) - (a._qualityScore || 0));

  const newOffset = isLoadMore ? offset + limit : limit;

  // Load additional profiles from relays in background
  await loadProfilesBySearchTerm(term, {
    onProfileEvent: (event: any, url: string) => {
      console.log(`[PROFILE-SEARCH] Profile event loaded from relay: ${url}`, event.id);
    }
  });

  return {
    results: validResults,
    newOffset,
  };
};
