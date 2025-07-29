import { SearchResult } from '@/lib/types/search';
import { getFollowerCount, getFollowingCount, isFollowing } from '@/lib/utils/followUtils';
import { repository } from '@welshman/app';
import { load, request } from '@welshman/net';
import { Router } from '@welshman/router';
import { COMMENT, Filter, FOLLOWS, LONG_FORM, NOTE, REACTION } from '@welshman/util';
import { Platform } from 'react-native';


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
      // console.log(`[ACTIVITY] Most recent activity for ${pubkey.substring(0, 8)}...: ${mostRecentEvent.kind} at ${mostRecentEvent.created_at}`);
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

    const followerCount = getFollowerCount(pubkey);
    const followingCount = getFollowingCount(pubkey);
    const isUserFollowing = isFollowing(pubkey);

    const recentActivityTimestamp = await getRecentActivityTimestamp(pubkey);

    return {
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

/**
 * Load a profile by pubkey and return it as a SearchResult
 * This function can be used to load a profile when a valid profile link is detected
 */
export const loadProfileByPubkey = async (pubkey: string, relays?: string[]): Promise<SearchResult | null> => {
  try {
    console.log('[PROFILE-LOADING] Loading profile by pubkey:', pubkey.substring(0, 8) + '...');

    // First check repository for existing profile
    const profileFilter = { kinds: [0], authors: [pubkey] };
    let localEvents = repository.query([profileFilter]);

    console.log('[PROFILE-LOADING] Local events found:', localEvents.length);

    if (localEvents.length > 0) {
      const event = localEvents[0];
      const profile = JSON.parse(event.content || '{}');
      console.log('[PROFILE-LOADING] Found local profile:', profile.name || profile.display_name || 'Loading...');
      const profileDataResult = await getProfileData(event.pubkey, profile);

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
          // Profile fields
          name: profile.name || '',
          display_name: profile.display_name || '',
          picture: profile.picture || '',
          about: profile.about || '',
          website: profile.website || '',
          lud06: profile.lud06 || '',
          lud16: profile.lud16 || '',
          nip05: profile.nip05 || '',
          // Banner image fields
          banner: profile.banner || '',
          cover_image: profile.cover_image || '',
          cover: profile.cover || '',
          header_image: profile.header_image || '',
        },
        description: profile.about || '',
        imageUrl: profile.picture || '',
      };
    }

    // If not found locally, load from relays
    const searchRelays = Router.get().Search().getUrls();
    const indexRelays = Router.get().Index().getUrls();
    const defaultRelays = Router.get().Default().getUrls();

    const relaysToUse = relays || [
      ...(searchRelays.length > 0 ? searchRelays.slice(0, 3) : []),
      ...(indexRelays.length > 0 ? indexRelays.slice(0, 3) : []),
      ...(defaultRelays.length > 0 ? defaultRelays.slice(0, 3) : [])
    ];

    // Remove duplicates and limit to reasonable number
    const uniqueRelays = [...new Set(relaysToUse)].slice(0, 6);

    console.log('[PROFILE-LOADING] Loading from relays:', uniqueRelays);

    const profileEvents = await load({
      relays: uniqueRelays,
      filters: [{ kinds: [0], authors: [pubkey] }],
    }) as any[];

    console.log('[PROFILE-LOADING] Relay events found:', profileEvents?.length || 0);

    if (profileEvents && profileEvents.length > 0) {
      const event = profileEvents[0];
      const profile = JSON.parse(event.content || '{}');
      console.log('[PROFILE-LOADING] Found relay profile:', profile.name || profile.display_name || 'Loading...');
      const profileDataResult = await getProfileData(event.pubkey, profile);

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
          // Profile fields
          name: profile.name || '',
          display_name: profile.display_name || '',
          picture: profile.picture || '',
          about: profile.about || '',
          website: profile.website || '',
          lud06: profile.lud06 || '',
          lud16: profile.lud16 || '',
          nip05: profile.nip05 || '',
          // Banner image fields
          banner: profile.banner || '',
          cover_image: profile.cover_image || '',
          cover: profile.cover || '',
          header_image: profile.header_image || '',
        },
        description: profile.about || '',
        imageUrl: profile.picture || '',
      };
    }

    console.warn('[PROFILE-LOADING] Profile not found:', pubkey.substring(0, 8) + '...');
    console.log('[PROFILE-LOADING] Tried relays:', uniqueRelays);
    return null;
  } catch (error) {
    console.error('[PROFILE-LOADING] Error loading profile by pubkey:', error);
    return null;
  }
};
