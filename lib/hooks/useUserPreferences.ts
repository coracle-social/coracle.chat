import { userPreferencesStore } from '@/lib/stores/user-preferences-store';
import { useStore } from '@/lib/stores/useWelshmanStore2';

export const useUserPreferences = () => {
  const [state] = useStore(userPreferencesStore);

  if (!state) {
    return {
      postLength: userPreferencesStore.getPostLength(),
      urlPreviews: userPreferencesStore.getUrlPreviews(),
      setPostLength: userPreferencesStore.setPostLength,
      setUrlPreviews: userPreferencesStore.setUrlPreviews,
      togglePostLength: userPreferencesStore.togglePostLength,
      toggleUrlPreviews: userPreferencesStore.toggleUrlPreviews,
      getPostLength: userPreferencesStore.getPostLength,
      getUrlPreviews: userPreferencesStore.getUrlPreviews
    };
  }

  return {
    ...state,
    setPostLength: userPreferencesStore.setPostLength,
    setUrlPreviews: userPreferencesStore.setUrlPreviews,
    togglePostLength: userPreferencesStore.togglePostLength,
    toggleUrlPreviews: userPreferencesStore.toggleUrlPreviews,
    getPostLength: userPreferencesStore.getPostLength,
    getUrlPreviews: userPreferencesStore.getUrlPreviews
  };
};
