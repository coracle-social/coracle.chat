import { userPreferencesStore } from '@/lib/stores/user-preferences-store';
import { useStore } from '@/lib/stores/useWelshmanStore2';

export const useUserPreferences = () => {
  const [state] = useStore(userPreferencesStore);

  if (!state) {
    return {
      postLength: userPreferencesStore.getPostLength(),
      urlPreviews: userPreferencesStore.getUrlPreviews(),
      hideSensitiveContent: userPreferencesStore.getHideSensitiveContent(),
      setPostLength: userPreferencesStore.setPostLength,
      setUrlPreviews: userPreferencesStore.setUrlPreviews,
      setHideSensitiveContent: userPreferencesStore.setHideSensitiveContent,
      togglePostLength: userPreferencesStore.togglePostLength,
      toggleUrlPreviews: userPreferencesStore.toggleUrlPreviews,
      toggleHideSensitiveContent: userPreferencesStore.toggleHideSensitiveContent,
      getPostLength: userPreferencesStore.getPostLength,
      getUrlPreviews: userPreferencesStore.getUrlPreviews,
      getHideSensitiveContent: userPreferencesStore.getHideSensitiveContent
    };
  }

  return {
    ...state,
    setPostLength: userPreferencesStore.setPostLength,
    setUrlPreviews: userPreferencesStore.setUrlPreviews,
    setHideSensitiveContent: userPreferencesStore.setHideSensitiveContent,
    togglePostLength: userPreferencesStore.togglePostLength,
    toggleUrlPreviews: userPreferencesStore.toggleUrlPreviews,
    toggleHideSensitiveContent: userPreferencesStore.toggleHideSensitiveContent,
    getPostLength: userPreferencesStore.getPostLength,
    getUrlPreviews: userPreferencesStore.getUrlPreviews,
    getHideSensitiveContent: userPreferencesStore.getHideSensitiveContent
  };
};
