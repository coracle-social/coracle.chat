import { follow, getFollowers, getFollows, getFollowsWhoFollow, pubkey, unfollow } from '@welshman/app';
import { load } from '@welshman/net';
import { Router } from '@welshman/router';
import { FOLLOWS } from '@welshman/util';
import { Alert, Platform } from 'react-native';

/**
 * Checks if the current user is following a specific profile
 * @param targetPubkey - The pubkey of the profile to check
 * @returns true if user is following
 */
export const isFollowing = (targetPubkey: string): boolean => {
  try {
    const currentUserPubkey = pubkey.get();
    if (!currentUserPubkey) return false;

    const follows = getFollows(currentUserPubkey);
    return follows.includes(targetPubkey);
  } catch (error) {
    console.error('[FOLLOW] Error checking follow status:', error);
    return false;
  }
};

/**
 * Gets the current user's following list
 * @returns Array of pubkeys the user is following
 */
export const getCurrentUserFollows = (): string[] => {
  try {
    const currentUserPubkey = pubkey.get();
    if (!currentUserPubkey) return [];

    return getFollows(currentUserPubkey);
  } catch (error) {
    console.error('[FOLLOW] Error getting user follows:', error);
    return [];
  }
};

/**
 * Gets the followers of a specific profile
 * @param targetPubkey - The pubkey of the profile
 * @returns Array of pubkeys following the target
 */
export const getProfileFollowers = (targetPubkey: string): string[] => {
  try {
    return getFollowers(targetPubkey);
  } catch (error) {
    console.error('[FOLLOW] Error getting profile followers:', error);
    return [];
  }
};

/**
 * Gets the count of followers for a specific profile
 * @param targetPubkey - The pubkey of the profile
 * @returns Number of followers
 */
export const getFollowerCount = (targetPubkey: string): number => {
  try {
    const followers = getFollowers(targetPubkey);
    return followers.length;
  } catch (error) {
    console.error('[FOLLOW] Error getting follower count:', error);
    return 0;
  }
};

/**
 * Gets the count of profiles a user is following
 * @param userPubkey - The pubkey of the user (defaults to current user)
 * @returns Number of profiles being followed
 */
export const getFollowingCount = (userPubkey?: string): number => {
  try {
    const targetPubkey = userPubkey || pubkey.get();
    if (!targetPubkey) return 0;

    const follows = getFollows(targetPubkey);
    return follows.length;
  } catch (error) {
    console.error('[FOLLOW] Error getting following count:', error);
    return 0;
  }
};

/**
 * Follow a profile using the Welshman follow function
 * @param targetPubkey - The pubkey of the profile to follow
 * @returns Promise that resolves when the follow action is completed
 */
export const followProfile = async (targetPubkey: string): Promise<void> => {
  try {
    console.log('[FOLLOW] Following profile:', targetPubkey);

    // Check if already following
    const alreadyFollowing = isFollowing(targetPubkey);
    if (alreadyFollowing) {
      console.log('[FOLLOW] Already following this profile');
      return;
    }
    await follow(['p', targetPubkey]);

    console.log('[FOLLOW] Profile followed successfully');
  } catch (error) {
    console.error('[FOLLOW] Error following profile:', error);

    if (Platform.OS !== 'web') {
      Alert.alert(
        'Follow Failed',
        'Unable to follow this profile. Please try again.',
        [{ text: 'OK' }]
      );
    }

    throw error;
  }
};

/**
 * Unfollow a profile using the Welshman unfollow function
 * @param targetPubkey - The pubkey of the profile to unfollow
 * @returns Promise that resolves when the unfollow action is completed
 */
export const unfollowProfile = async (targetPubkey: string): Promise<void> => {
  try {
    console.log('[FOLLOW] Unfollowing profile:', targetPubkey);

    // Check if currently following
    const currentlyFollowing = isFollowing(targetPubkey);
    if (!currentlyFollowing) {
      console.log('[FOLLOW] Not currently following this profile');
      return;
    }

    // Use the Welshman unfollow function
    await unfollow(targetPubkey);

    console.log('[FOLLOW] Profile unfollowed successfully');
  } catch (error) {
    console.error('[FOLLOW] Error unfollowing profile:', error);

    // Show user-friendly error message
    if (Platform.OS !== 'web') {
      Alert.alert(
        'Unfollow Failed',
        'Unable to unfollow this profile. Please try again.',
        [{ text: 'OK' }]
      );
    }

    throw error;
  }
};

/**
 * Toggle follow status for a profile
 * @param targetPubkey - The pubkey of the profile to toggle follow status
 * @returns Promise that resolves to the new follow status (true = following, false = not following)
 */
export const toggleFollowProfile = async (targetPubkey: string): Promise<boolean> => {
  try {
    const currentlyFollowing = isFollowing(targetPubkey);

    if (currentlyFollowing) {
      await unfollowProfile(targetPubkey);
      return false;
    } else {
      await followProfile(targetPubkey);
      return true;
    }
  } catch (error) {
    console.error('[FOLLOW] Error toggling follow status:', error);
    throw error;
  }
};

/**
 * Load follow data for a profile (followers and following counts)
 * This function can be used to refresh follow data from relays
 * @param targetPubkey - The pubkey of the profile
 */
export const loadFollowData = async (targetPubkey: string): Promise<void> => {
  try {
    console.log('[FOLLOW] Loading follow data for:', targetPubkey);

    // Load contact lists (kind 3) for the target profile
    const contactListFilter = {
      kinds: [FOLLOWS],
      authors: [targetPubkey],
    };

    // Load from relays
    await load({
      filters: [contactListFilter],
      relays: Router.get().Index().getUrls(),
    });

    console.log('[FOLLOW] Follow data loaded successfully');
  } catch (error) {
    console.error('[FOLLOW] Error loading follow data:', error);
  }
};

/**
 * Get mutual connections between two users
 * @param userPubkey - The first user's pubkey
 * @param targetPubkey - The second user's pubkey
 * @returns Array of pubkeys that both users follow
 */
export const getMutualConnections = (userPubkey: string, targetPubkey: string): string[] => {
  try {
    const mutualConnections = getFollowsWhoFollow(userPubkey, targetPubkey);
    return mutualConnections;
  } catch (error) {
    console.error('[FOLLOW] Error getting mutual connections:', error);
    return [];
  }
};
