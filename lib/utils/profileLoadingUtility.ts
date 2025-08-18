import { getFollowerCount, getFollowingCount, isFollowing } from '@/lib/utils/followUtils';
import { repository } from '@welshman/app';
import { COMMENT, Filter, FOLLOWS, LONG_FORM, NOTE, REACTION } from '@welshman/util';
import { loadFromRelays } from './relayLoadingUtils';

/**
 * Get the most recent activity timestamp for a profile
 * This queries various event kinds that represent user activity
 * Pretty expensive, but will fold into an event section of a users profile
 */
export const getRecentActivityTimestamp = async (pubkey: string): Promise<number | null> => {
  // Query for recent activity across different event kinds
  const activityFilter: Filter = {
    authors: [pubkey],
    kinds: [NOTE, LONG_FORM, COMMENT, REACTION, FOLLOWS],
    limit: 1,
  };

  let recentEvents = repository.query([activityFilter]);

  if (recentEvents.length === 0) {
    await loadFromRelays({
      filters: [activityFilter],
      onEvent: (event, url) => {
        console.log(`[ACTIVITY] Activity event loaded from relay: ${url}`, event.id);
      }
    });
    recentEvents = repository.query([activityFilter]);
  }

  if (recentEvents.length > 0) {
    // Sort by created_at and get the most recent
    const mostRecentEvent = recentEvents.sort((a, b) => b.created_at - a.created_at)[0];
    // console.log(`[ACTIVITY] Most recent activity for ${pubkey.substring(0, 8)}...: ${mostRecentEvent.kind} at ${mostRecentEvent.created_at}`);
    return mostRecentEvent.created_at;
  }

  return null;
};

/**
 * Get comprehensive profile data including verification, follow counts, and recent activity
 */
export const getProfileData = async (pubkey: string, profile: any) => {
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
};

/**
 * Load follow data for a profile (followers and following counts)
 * This function can be used to refresh follow data from relays
 */
export const loadProfileFollowData = async (targetPubkey: string): Promise<void> => {
  console.log('[PROFILE-LOADING] Loading follow data for:', targetPubkey);

  // Load contact lists (kind 3) for the target profile
  const contactListFilter = {
    kinds: [FOLLOWS],
    authors: [targetPubkey],
  };

  await loadFromRelays({
    filters: [contactListFilter],
    onEvent: (event, url) => {
      console.log(`[PROFILE-LOADING] Follow event loaded from relay: ${url}`, event.id);
    }
  });

  console.log('[PROFILE-LOADING] Follow data loaded successfully');
};
