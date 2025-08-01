import { follow, getFollowers, getFollows, pubkey, unfollow } from '@welshman/app';

export const isFollowing = (targetPubkey: string): boolean => {
    const currentUserPubkey = pubkey.get();
    if (!currentUserPubkey) return false;
    const follows = getFollows(currentUserPubkey);
    return follows.includes(targetPubkey);
};

export const getCurrentUserFollows = (): string[] => {
    const currentUserPubkey = pubkey.get();
    if (!currentUserPubkey) return [];
    return getFollows(currentUserPubkey);
};

export const getFollowerCount = (targetPubkey: string): number => {
    const followers = getFollowers(targetPubkey);
    return followers.length;
};

export const getFollowingCount = (userPubkey?: string): number => {
    const targetPubkey = userPubkey || pubkey.get();
    if (!targetPubkey) return 0;
    const follows = getFollows(targetPubkey);
    return follows.length;
};

export const followProfile = async (targetPubkey: string): Promise<void> => {
    const alreadyFollowing = isFollowing(targetPubkey);
    if (alreadyFollowing) {
      console.log('[FOLLOW] Already following this profile');
      return;
    }
    await follow(['p', targetPubkey]);

    console.log('[FOLLOW] Profile followed successfully');
};

export const unfollowProfile = async (targetPubkey: string): Promise<void> => {
    const currentlyFollowing = isFollowing(targetPubkey);
    if (!currentlyFollowing) {
      console.log('[FOLLOW] Not currently following this profile');
      return;
    }

    // Use the Welshman unfollow function
    await unfollow(targetPubkey);
};

export const toggleFollowProfile = async (targetPubkey: string): Promise<boolean> => {
    const currentlyFollowing = isFollowing(targetPubkey);

    if (currentlyFollowing) {
      await unfollowProfile(targetPubkey);
      return false;
    } else {
      await followProfile(targetPubkey);
      return true;
    }
};
