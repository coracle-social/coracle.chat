import { BareEvent, WotSearchOptions } from '@/lib/types/search';
import { getFollowerCount, getFollowingCount, isFollowing } from '@/lib/utils/followUtils';
import { loadProfileFollowData } from '@/lib/utils/profileLoadingUtility';
import { getFollowers, getFollows, getNetwork, loadProfile, maxWot, pubkey, repository, wotGraph } from '@welshman/app';

// Calculate network distance for a target pubkey
const calculateNetworkDistance = (targetPubkey: string): number => {
  const userPubkey = pubkey.get();
  if (!userPubkey) return Infinity;

  const userFollows = getFollows(userPubkey);
  const userFollowers = getFollowers(userPubkey);

  // Direct connections
  if (userFollows.includes(targetPubkey) || userFollowers.includes(targetPubkey)) {
    return 1;
  }

  // Check if in immediate network (2 hops)
  const network = getNetwork(userPubkey);
  if (network.includes(targetPubkey)) {
    return 2;
  }

  // Check if in WoT graph (3+ hops)
  const graph = wotGraph.get();
  if (graph.has(targetPubkey)) {
    return 3;
  }

  return Infinity;
};

export const wotEnhancedProfileSearch = async (
  searchTerm: string,
  wotOptions: WotSearchOptions = {},
  profileSearchStore?: any
): Promise<BareEvent[]> => {
  const userPubkey = pubkey.get();
  if (!userPubkey) return [];

  const graph = wotGraph.get();
  const maxScore = maxWot.get();

  // Get pubkeys to process
  const pubkeys = searchTerm.toLowerCase() === 'all'
    ? getFollows(userPubkey)
    : profileSearchStore?.searchOptions(searchTerm)?.map((r: any) => r.event.pubkey) || [];

  // Filter by network distance and WoT score
  const filteredPubkeys = pubkeys.filter((pubkey: string) => {
      const score = graph.get(pubkey) || 0;
    const inNetwork = wotOptions.networkDistance === 1
      ? [...getFollows(userPubkey), ...getFollowers(userPubkey)].includes(pubkey)
      : wotOptions.networkDistance === 2
        ? getNetwork(userPubkey).includes(pubkey)
        : graph.has(pubkey);

    return inNetwork &&
           (wotOptions.minScore === undefined || score >= wotOptions.minScore) &&
             (wotOptions.maxScore === undefined || score <= wotOptions.maxScore);
    });

  // Load profiles and create events
  await Promise.allSettled(filteredPubkeys.map((pubkey: string) => loadProfileFollowData(pubkey)));

  const results = await Promise.all(
    filteredPubkeys.map(async (pubkey: string) => {
      await loadProfile(pubkey);

      // Get profile from repository
      const profileFilter = { kinds: [0], authors: [pubkey] };
      const localEvents = repository.query([profileFilter]);
      if (localEvents.length === 0) return null;

      const event = localEvents[0];
      const profile = JSON.parse(event.content || '{}');

      const wotScore = graph.get(pubkey) || 0;
      const normalizedScore = maxScore > 0 ? wotScore / maxScore : 0;
      const trustLevel = wotScore < 0 ? 'negative' : wotScore === 0 ? 'low' :
                        normalizedScore >= 0.7 ? 'high' : normalizedScore >= 0.3 ? 'medium' : 'low';
      const networkDistance = calculateNetworkDistance(pubkey);

      if (wotOptions.trustLevels && !wotOptions.trustLevels.includes(trustLevel)) return null;

      return {
        id: `wot-${pubkey}`,
        type: 'profile',
        event: { id: `wot-event-${pubkey}`, pubkey, created_at: Math.floor(Date.now() / 1000), kind: 0, tags: [], content: JSON.stringify(profile), sig: '', ...profile },
        authorPubkey: pubkey,
        verified: !!profile.nip05,
        followerCount: getFollowerCount(pubkey),
        followingCount: getFollowingCount(pubkey),
        isFollowing: isFollowing(pubkey),
        wotScore: normalizedScore,
        trustLevel: trustLevel as 'high' | 'medium' | 'low' | 'negative',
        networkDistance: networkDistance,
      };
    })
  );

  return results
    .filter(Boolean)
    .sort((a, b) => (b.wotScore || 0) - (a.wotScore || 0))
    .slice(0, wotOptions.limit || 50) as BareEvent[];
};
