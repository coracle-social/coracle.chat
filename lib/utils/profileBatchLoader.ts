import { BareEvent } from '@/lib/types/search';
import { loadProfile, repository } from '@welshman/app';
import { load } from '@welshman/net';
import { Router } from '@welshman/router';

interface ProfileRequest {
  pubkey: string;
  relays?: string[];
  onProfileLoaded?: (profile: BareEvent) => void;
  onProfileError?: (pubkey: string, error: any) => void;
}

class SimpleProfileLoader {
  private loadingPromises = new Map<string, Promise<BareEvent | null>>();

  async requestProfile(request: ProfileRequest): Promise<BareEvent | null> {
    const { pubkey, relays, onProfileLoaded, onProfileError } = request;

    // Return existing promise if already loading
    if (this.loadingPromises.has(pubkey)) {
      return this.loadingPromises.get(pubkey)!;
    }

    const promise = this.loadProfileWithCallback(request);
    this.loadingPromises.set(pubkey, promise);

    promise.finally(() => {
      this.loadingPromises.delete(pubkey);
    });

    return promise;
  }

  private async loadProfileWithCallback(request: ProfileRequest): Promise<BareEvent | null> {
    const { pubkey, relays, onProfileLoaded, onProfileError } = request;

    try {
      // Use Welshman's built-in profile loading
      await loadProfile(pubkey, relays);

      // Get profile from repository
      const profileFilter = { kinds: [0], authors: [pubkey] };
      const localEvents = repository.query([profileFilter]);

      if (localEvents.length > 0) {
        const event = localEvents[0];
        const profile = JSON.parse(event.content || '{}');
        const bareEvent = this.createBareEvent(event, profile);
        onProfileLoaded?.(bareEvent);
        return bareEvent;
      } else {
        // Try loading from relays if not in cache
        const relayUrls = relays || Router.get().Index().getUrls();
        await load({
          filters: [{ kinds: [0], authors: [pubkey] }],
          relays: relayUrls,
        });

        // Query repository again after loading
        const eventsAfterLoad = repository.query([profileFilter]);
        if (eventsAfterLoad.length > 0) {
          const event = eventsAfterLoad[0];
          const profile = JSON.parse(event.content || '{}');
          const bareEvent = this.createBareEvent(event, profile);
          onProfileLoaded?.(bareEvent);
          return bareEvent;
        }
      }
      return null;

    } catch (error) {
      onProfileError?.(pubkey, error);
      return null;
    }
  }

  private createBareEvent(event: any, profile: any): BareEvent {
    return {
      id: `profile-${event.pubkey}`,
      type: 'profile',
      event: {
        ...event,
        ...profile, // Merge profile data into event
      },
      authorPubkey: event.pubkey,
      verified: !!profile.nip05,
      followerCount: 0,
      followingCount: 0,
      isFollowing: false,
    };
  }

  clear() {
    this.loadingPromises.clear();
  }
}

export const simpleProfileLoader = new SimpleProfileLoader();
