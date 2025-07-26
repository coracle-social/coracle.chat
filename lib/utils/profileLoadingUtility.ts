import { getFollowerCount, getFollowingCount, isFollowing } from '@/lib/utils/followUtils';
import { repository } from '@welshman/app';
import { load, request } from '@welshman/net';
import { Router } from '@welshman/router';
import { COMMENT, Filter, FOLLOWS, LONG_FORM, NOTE, REACTION } from '@welshman/util';
import { Platform } from 'react-native';

//have heard of bad actors having nip05, not sure how to better define verification unless its wot
//probably shouldnt be verified, but maybe we can use it to filter out bad actors
export const checkVerification = (profile: any) => {
  const verificationTypes = {
    nip05: !!profile.nip05, // Domain verification
    lud06: !!profile.lud06, // Lightning address
    lud16: !!profile.lud16, // Lightning address
    website: !!profile.website, // Website verification
    // Note: nip23, nip26, nip46 may not be standard profile fields
    // but we'll check if they exist
    nip23: !!(profile as any).nip23, // Nostr address
    nip26: !!(profile as any).nip26, // Delegated event signing
    nip46: !!(profile as any).nip46, // Nostr Connect
  };

  const hasAnyVerification = Object.values(verificationTypes).some(Boolean);
  const verificationCount = Object.values(verificationTypes).filter(Boolean).length;

  return {
    isVerified: hasAnyVerification,
    verificationCount,
    verificationTypes,
    verificationScore: verificationCount * 0.5, // Weighted score
  };
};

/**
 * Get the most recent activity timestamp for a profile
 * This queries various event kinds that represent user activity
 * Pretty expensive, but will fold into an event section of a users profile
 */
export const getRecentActivityTimestamp = async (pubkey: string): Promise<number | null> => {
  try {
    // Query for recent activity across different event kinds
    const activityFilter: Filter = {
      authors: [pubkey],
      kinds: [NOTE, LONG_FORM, COMMENT, REACTION, FOLLOWS],
      limit: 1,
    };

    let recentEvents = repository.query([activityFilter]);

    if (recentEvents.length === 0) {
      console.log('[ACTIVITY] No local activity data, loading from relays for:', pubkey);

      if (Platform.OS === 'web') {
        await load({
          filters: [activityFilter],
          relays: Router.get().Index().getUrls(),
        });
        recentEvents = repository.query([activityFilter]);
      } else {
        await request({
          filters: [activityFilter],
          relays: Router.get().Index().getUrls(),
          autoClose: true,
          threshold: 0.1,
        });
        recentEvents = repository.query([activityFilter]);
      }
    }

    if (recentEvents.length > 0) {
      // Sort by created_at and get the most recent
      const mostRecentEvent = recentEvents.sort((a, b) => b.created_at - a.created_at)[0];
      console.log(`[ACTIVITY] Most recent activity for ${pubkey.substring(0, 8)}...: ${mostRecentEvent.kind} at ${mostRecentEvent.created_at}`);
      return mostRecentEvent.created_at;
    }

    return null;
  } catch (error) {
    console.error('[ACTIVITY] Error getting recent activity timestamp:', error);
    return null;
  }
};

/**
 * Get comprehensive profile data including verification, follow counts, and recent activity
 */
export const getProfileData = async (pubkey: string, profile: any) => {
  try {
    const verification = checkVerification(profile);

    const followerCount = getFollowerCount(pubkey);
    const followingCount = getFollowingCount(pubkey);
    const isUserFollowing = isFollowing(pubkey);

    const recentActivityTimestamp = await getRecentActivityTimestamp(pubkey);

    return {
      verification,
      followerCount,
      followingCount,
      isUserFollowing,
      recentActivityTimestamp,
    };
  } catch (error) {
    console.error('[PROFILE-LOADING] Error getting profile data:', error);
    return {
      verification: { isVerified: false, verificationCount: 0, verificationTypes: {}, verificationScore: 0 },
      followerCount: 0,
      followingCount: 0,
      isUserFollowing: false,
      recentActivityTimestamp: null,
    };
  }
};

/**
 * Load follow data for a profile (followers and following counts)
 * This function can be used to refresh follow data from relays
 */
export const loadProfileFollowData = async (targetPubkey: string): Promise<void> => {
  try {
    console.log('[PROFILE-LOADING] Loading follow data for:', targetPubkey);

    // Load contact lists (kind 3) for the target profile
    const contactListFilter = {
      kinds: [FOLLOWS],
      authors: [targetPubkey],
    };

    await load({
      filters: [contactListFilter],
      relays: Router.get().Index().getUrls(),
    });

    console.log('[PROFILE-LOADING] Follow data loaded successfully');
  } catch (error) {
    console.error('[PROFILE-LOADING] Error loading follow data:', error);
  }
};

/**
 * Load activity data for profiles from relays in the background
 * This helps populate recent activity timestamps
 */
export const loadActivityDataFromRelays = async (pubkeys: string[]) => {
  try {
    if (pubkeys.length === 0) return;

    console.log('[PROFILE-LOADING] Loading activity data for profiles:', pubkeys.length);

    const activityFilter: Filter = {
      authors: pubkeys,
      kinds: [NOTE, LONG_FORM, COMMENT, REACTION, FOLLOWS], // Profile activity types
      limit: 100, // Get recent activity for each profile
    };

    // Load from relays
    const searchRelays = Router.get().Search().getUrls();
    const indexRelays = Router.get().Index().getUrls();
    const relaysToUse = searchRelays.length > 0 ? searchRelays : indexRelays;

    console.log('[PROFILE-LOADING] Loading activity from relays:', relaysToUse);

    if (Platform.OS === 'web') {
      const activityLoad = await load({
        filters: [activityFilter],
        relays: relaysToUse,
      });
      console.log('[PROFILE-LOADING] Activity load result:', activityLoad);
    } else {
      const events = await request({
        filters: [activityFilter],
        relays: relaysToUse,
        autoClose: true,
        threshold: 0.1,
        onEvent: (event, url) => {
          // console.log(`Activity event from ${url}:`, event.id)
        },
        onEose: (url) => {
          //console.log(`EOSE from ${url}`)
        },
        onDisconnect: (url) => {
          //console.log(`Disconnected from ${url}`)
        }
      });
      console.log('[PROFILE-LOADING] Activity request result:', events);
    }
  } catch (error) {
    console.error('[PROFILE-LOADING] Error loading activity data from relays:', error);
  }
};
