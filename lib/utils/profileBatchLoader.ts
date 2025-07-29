import { PUBLIC_RELAYS } from '@/core/env/MetaConfig';
import { SearchResult } from '@/lib/types/search';
import { getProfileData } from '@/lib/utils/profileLoadingUtility';
import { repository } from '@welshman/app';
import { load } from '@welshman/net';

interface BatchProfileRequest {
  pubkey: string;
  relays?: string[];
  onProfileLoaded?: (profile: SearchResult) => void;
  onProfileError?: (pubkey: string, error: any) => void;
}

interface BatchProfileResult {
  pubkey: string;
  profile: SearchResult | null;
  error?: any;
}

class ProfileBatchLoader {
  private pendingRequests = new Map<string, BatchProfileRequest>();
  private loadingPromises = new Map<string, Promise<BatchProfileResult>>();
  private batchTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly BATCH_DELAY = 50; // ms to wait before processing batch
  private readonly MAX_BATCH_SIZE = 20; // max profiles per batch
  //^should move to config file

  /**
   * Request a profile to be loaded in the next batch
   */
  requestProfile(request: BatchProfileRequest) {
    const { pubkey } = request;

    // If already loading this pubkey, return existing promise
    if (this.loadingPromises.has(pubkey)) {
      return this.loadingPromises.get(pubkey)!;
    }

    this.pendingRequests.set(pubkey, request);

    this.scheduleBatchProcessing();

    const promise = new Promise<BatchProfileResult>((resolve) => {
      request.onProfileLoaded = (profile) => {
        resolve({ pubkey, profile });
      };
      request.onProfileError = (pubkey, error) => {
        resolve({ pubkey, profile: null, error });
      };
    });

    this.loadingPromises.set(pubkey, promise);
    return promise;
  }

  /**
   * Schedule batch processing with a small delay to collect more requests
   */ //necessaary to delay??
  private scheduleBatchProcessing() {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.batchTimeout = setTimeout(() => {
      this.processBatch();
    }, this.BATCH_DELAY);
  }

  /**
   * Process the current batch of profile requests
   */
  private async processBatch() {
    if (this.pendingRequests.size === 0) return;

    const batchRequests = Array.from(this.pendingRequests.values()).slice(0, this.MAX_BATCH_SIZE);
    const pubkeys = batchRequests.map(req => req.pubkey);

    batchRequests.forEach(req => {
      this.pendingRequests.delete(req.pubkey);
    });

    console.log(`[BATCH-LOADER] Processing batch of ${batchRequests.length} profiles:`, pubkeys.map(p => p.substring(0, 8)));

    // Process each profile individually to show them as they load
    await this.loadProfilesIndividually(batchRequests);
  }

  private async loadProfilesIndividually(requests: BatchProfileRequest[]) {
    const pubkeys = requests.map(req => req.pubkey);

    const profileFilter = { kinds: [0], authors: pubkeys };
    let localEvents = repository.query([profileFilter]);

    console.log(`[BATCH-LOADER] Found ${localEvents.length} profiles in repository`);

    // Process local profiles immediately
    for (const request of requests) {
      const localEvent = localEvents.find(event => event.pubkey === request.pubkey);
      if (localEvent) {
        try {
          const profile = JSON.parse(localEvent.content || '{}');
          const profileDataResult = await getProfileData(localEvent.pubkey, profile);

          const searchResult = this.createSearchResult(localEvent, profile, profileDataResult);

          if (request.onProfileLoaded) {
            request.onProfileLoaded(searchResult);
          }

          this.loadingPromises.delete(request.pubkey);
        } catch (error) {
          console.error('[BATCH-LOADER] Error processing local profile:', error);
          if (request.onProfileError) {
            request.onProfileError(request.pubkey, error);
          }
          this.loadingPromises.delete(request.pubkey);
        }
      }
    }

    // Load missing profiles from relays
    const missingRequests = requests.filter(req =>
      !localEvents.some(event => event.pubkey === req.pubkey)
    );

    if (missingRequests.length > 0) {
      console.log(`[BATCH-LOADER] Loading ${missingRequests.length} missing profiles from relays`);

      // Load missing profiles in parallel with individual timeouts
      const loadPromises = missingRequests.map(async (request) => {
        try {
          const result = await this.loadSingleProfileFromRelays(request);
          return result;
        } catch (error) {
          console.error(`[BATCH-LOADER] Failed to load profile ${request.pubkey.substring(0, 8)}:`, error);
          if (request.onProfileError) {
            request.onProfileError(request.pubkey, error);
          }
          this.loadingPromises.delete(request.pubkey);
        }
      });

      // Wait for all to complete (but they notify individually to view them as they load)
      await Promise.allSettled(loadPromises);
    }
  }

  /**
   * Load a single profile from relays
   */
  private async loadSingleProfileFromRelays(request: BatchProfileRequest): Promise<void> {
    const { pubkey, relays } = request;

    const allRelays = new Set<string>();
    if (relays) {
      relays.forEach(relay => allRelays.add(relay));
    }
    const presetPublicRelays = PUBLIC_RELAYS.slice(0, 8);
    presetPublicRelays.forEach(relay => allRelays.add(relay));
    const relayUrls = Array.from(allRelays).slice(0, 10);

    // Try multiple relay sets with increasing timeout
    const relaySets = [
      relayUrls.slice(0, 4),   // First 4 relays, 3 second timeout
      relayUrls.slice(0, 6),   // First 6 relays, 5 second timeout
      relayUrls.slice(0, 8),   // First 8 relays, 7 second timeout
      relayUrls               // All relays, 10 second timeout
    ];

    const timeouts = [3000, 5000, 7000, 10000];

    for (let i = 0; i < relaySets.length; i++) {
      try {
        console.log(`[BATCH-LOADER] Loading ${pubkey.substring(0, 8)}... attempt ${i + 1}/${relaySets.length}`);

        const profileEvents = await Promise.race([
          load({
            relays: relaySets[i],
            filters: [{ kinds: [0], authors: [pubkey] }],
          }) as Promise<any[]>,
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Profile load timeout (${timeouts[i]}ms)`)), timeouts[i])
          )
        ]);

        if (profileEvents && profileEvents.length > 0) {
          const event = profileEvents[0];
          const profile = JSON.parse(event.content || '{}');
          const profileDataResult = await getProfileData(event.pubkey, profile);

          const searchResult = this.createSearchResult(event, profile, profileDataResult);

          if (request.onProfileLoaded) {
            request.onProfileLoaded(searchResult);
          }

          this.loadingPromises.delete(pubkey);
          return;
        }
      } catch (error) {
        console.warn(`[BATCH-LOADER] Attempt ${i + 1} failed for ${pubkey.substring(0, 8)}:`, error);
        if (i === relaySets.length - 1) {
          // Last attempt failed
          throw error;
        }
      }
    }

    // All attempts failed
    throw new Error('Profile not found');
  }

  // still loading explicit fields, will change to send in event/profile obj
  private createSearchResult(event: any, profile: any, profileDataResult: any): SearchResult {
    return {
      id: event.id,
      type: 'profile',
      title: profile.name || profile.display_name || 'Loading...',
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
        // Banner image fields (not loaded initially), different clients define banners differently
        banner: '',
        cover_image: '',
        cover: '',
        header_image: '',
      },
      metadata: {
        authorPubkey: event.pubkey,
        author: profile.name || profile.display_name || 'Loading...',
        timestamp: event.created_at,
        verified: profileDataResult.verification.isVerified,
        followerCount: profileDataResult.followerCount,
        followingCount: profileDataResult.followingCount,
        isFollowing: profileDataResult.isUserFollowing,
      },
      description: profile.about || '',
      imageUrl: profile.picture || '',
    };
  }

  /**
   * Clear all pending requests and loading promises
   */
  clear() {
    this.pendingRequests.clear();
    this.loadingPromises.clear();
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
  }
}

export const profileBatchLoader = new ProfileBatchLoader();

/**
 * Hook to request a profile from the batch loader
 */
export const useBatchProfileLoader = () => {
  const requestProfile = (pubkey: string, relays?: string[]) => {
    return profileBatchLoader.requestProfile({ pubkey, relays });
  };

  return { requestProfile };
};
