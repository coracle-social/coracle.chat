import { BareEvent } from '@/lib/types/search';
import { simpleProfileLoader } from '@/lib/utils/profileBatchLoader';
import { useEffect, useState } from 'react';

interface ProfileLoadingState {
  pubkey: string;
  isLoading: boolean;
  profile: BareEvent | undefined;
  basicInfo: {
    name?: string;
    displayName?: string;
    picture?: string;
  } | undefined;
  error: any;
}

export const useProfileLoading = (pubkey: string, relays?: string[], initialProfile?: BareEvent) => {
  const [state, setState] = useState<ProfileLoadingState>({
    pubkey,
    isLoading: !initialProfile,
    profile: initialProfile || undefined,
    basicInfo: initialProfile ? {
      name: initialProfile.event.name,
      displayName: initialProfile.event.display_name,
      picture: initialProfile.event.picture,
    } : undefined,
    error: undefined,
  });

  useEffect(() => {
    if (initialProfile) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        profile: initialProfile,
        basicInfo: {
          name: initialProfile.event.name,
          displayName: initialProfile.event.display_name,
          picture: initialProfile.event.picture,
        },
        error: undefined,
      }));
      return;
    }

    // Skip if pubkey hasn't changed
    if (state.pubkey === pubkey && state.profile) {
      return;
    }

    // Update pubkey and start loading
    setState(prev => ({
      ...prev,
      pubkey,
      isLoading: true,
      profile: undefined,
      basicInfo: undefined,
      error: undefined,
    }));

    const loadProfile = async () => {
      try {
        const profile = await simpleProfileLoader.requestProfile({ pubkey, relays });

        if (profile) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            profile: profile,
            basicInfo: {
              name: profile.event.name,
              displayName: profile.event.display_name,
              picture: profile.event.picture,
            },
            error: undefined,
          }));
        } else {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: new Error('Profile not found'),
          }));
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error,
        }));
      }
    };

    loadProfile();
  }, [pubkey, relays, initialProfile]);

  return state;
};
