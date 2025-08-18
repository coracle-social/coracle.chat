import { useStore } from '@/lib/stores/useWelshmanStore2';
import { BareEvent } from '@/lib/types/search';
import { deriveProfile } from '@welshman/app';
import { useEffect, useState } from 'react';

export const useProfile = (pubkey: string, relays?: string[]) => {
  const profileStore = deriveProfile(pubkey, relays);
  return useStore(profileStore);
}

interface ProfileLoadingState {
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
  const [profile] = useProfile(pubkey, relays);
  const [state, setState] = useState<ProfileLoadingState>({
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
      setState({
        isLoading: false,
        profile: initialProfile,
        basicInfo: {
          name: initialProfile.event.name,
          displayName: initialProfile.event.display_name,
          picture: initialProfile.event.picture,
        },
        error: undefined,
      });
      return;
    }

    // Use the profile from the derived store
    if (profile) {
      setState({
        isLoading: false,
        profile: profile as BareEvent,
        basicInfo: {
          name: profile.name,
          displayName: profile.display_name,
          picture: profile.picture,
        },
        error: undefined,
      });
    } else {
      setState({
        isLoading: true,
        profile: undefined,
        basicInfo: undefined,
        error: undefined,
      });
    }
  }, [pubkey, relays, initialProfile, profile]);

  return state;
};
