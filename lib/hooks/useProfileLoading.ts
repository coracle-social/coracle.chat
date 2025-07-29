import { SearchResult } from '@/lib/types/search';
import { useBatchProfileLoader } from '@/lib/utils/profileBatchLoader';
import { useEffect, useState } from 'react';

interface ProfileLoadingState {
  pubkey: string;
  isLoading: boolean;
  profile: SearchResult | null;
  basicInfo: {
    name?: string;
    displayName?: string;
    picture?: string;
  } | null;
  error: any;
}

export const useProfileLoading = (pubkey: string, relays?: string[], initialProfile?: SearchResult) => {
  const { requestProfile } = useBatchProfileLoader();
  const [state, setState] = useState<ProfileLoadingState>({
    pubkey,
    isLoading: !initialProfile,
    profile: initialProfile || null,
    basicInfo: initialProfile ? {
      name: initialProfile.event.name,
      displayName: initialProfile.event.display_name,
      picture: initialProfile.event.picture,
    } : null,
    error: null,
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
        error: null,
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
      profile: null,
      basicInfo: null,
      error: null,
    }));

    const loadProfile = async () => {
      try {
        const result = await requestProfile(pubkey, relays);

        if (result.profile) {
          const profile = result.profile;
          setState(prev => ({
            ...prev,
            isLoading: false,
            profile: profile,
            basicInfo: {
              name: profile.event.name,
              displayName: profile.event.display_name,
              picture: profile.event.picture,
            },
            error: null,
          }));
        } else {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: result.error,
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
  }, [pubkey, relays, initialProfile, requestProfile]);

  return state;
};
