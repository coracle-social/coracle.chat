import { pubkey } from '@welshman/app';
import { platformStorageProvider } from '../../core/state/storage-provider';

type UserPreferencesState = {
  postLength: 'mini' | 'full';
  urlPreviews: 'enabled' | 'disabled';
  hideSensitiveContent: 'enabled' | 'disabled';
};

type UserPreferencesStore = {
  subscribe: (callback: (state: UserPreferencesState) => void) => () => void;
  set: (state: Partial<UserPreferencesState>) => void;
  setPostLength: (mode: 'mini' | 'full') => void;
  setUrlPreviews: (mode: 'enabled' | 'disabled') => void;
  setHideSensitiveContent: (mode: 'enabled' | 'disabled') => void;
  togglePostLength: () => void;
  toggleUrlPreviews: () => void;
  toggleHideSensitiveContent: () => void;
  getPostLength: () => 'mini' | 'full';
  getUrlPreviews: () => 'enabled' | 'disabled';
  getHideSensitiveContent: () => 'enabled' | 'disabled';
  loadSavedPreferences: () => Promise<void>;
  savePreferences: (preferences: Partial<UserPreferencesState>) => Promise<void>;
};

class UserPreferencesStoreImpl implements UserPreferencesStore {
  private state: UserPreferencesState = {
    postLength: 'mini', // Default to mini posts
    urlPreviews: 'enabled', // Default to enabled
    hideSensitiveContent: 'disabled', // Default to showing sensitive content
  };

  private subscribers: Set<(state: UserPreferencesState) => void> = new Set();
  private pubkeyUnsubscribe: (() => void) | undefined;

  constructor() {
    // Load saved preferences on initialization
    this.loadSavedPreferences();

    // Subscribe to pubkey changes to reload preferences when profile switches
    this.pubkeyUnsubscribe = pubkey.subscribe(() => {
      this.loadSavedPreferences();
    });
  }

  private getProfileKey(key: string): string {
    const currentPubkey = pubkey.get();
    return currentPubkey ? `${currentPubkey}_${key}` : key;
  }

  subscribe(callback: (state: UserPreferencesState) => void) {
    this.subscribers.add(callback);
    // Call immediately with current state
    callback(this.state);

    return () => {
      this.subscribers.delete(callback);
    };
  }

  set(newState: Partial<UserPreferencesState>) {
    this.state = { ...this.state, ...newState };
    this.notifySubscribers();
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.state));
  }

  setPostLength = async (mode: 'mini' | 'full') => {
    this.set({ postLength: mode });
    await this.savePreferences({ postLength: mode });
  };

  setUrlPreviews = async (mode: 'enabled' | 'disabled') => {
    this.set({ urlPreviews: mode });
    await this.savePreferences({ urlPreviews: mode });
  };

  togglePostLength = async () => {
    const newMode = this.state.postLength === 'mini' ? 'full' : 'mini';
    await this.setPostLength(newMode);
  };

  toggleUrlPreviews = async () => {
    const newMode = this.state.urlPreviews === 'enabled' ? 'disabled' : 'enabled';
    await this.setUrlPreviews(newMode);
  };

  setHideSensitiveContent = async (mode: 'enabled' | 'disabled') => {
    this.set({ hideSensitiveContent: mode });
    await this.savePreferences({ hideSensitiveContent: mode });
  };

  toggleHideSensitiveContent = async () => {
    const newMode = this.state.hideSensitiveContent === 'enabled' ? 'disabled' : 'enabled';
    await this.setHideSensitiveContent(newMode);
  };

  getPostLength = () => {
    return this.state.postLength;
  };

  getUrlPreviews = () => {
    return this.state.urlPreviews;
  };

  getHideSensitiveContent = () => {
    return this.state.hideSensitiveContent;
  };

  loadSavedPreferences = async () => {
    const savedPostLength = await platformStorageProvider.get(this.getProfileKey('postLengthMode'));
    const savedUrlPreviews = await platformStorageProvider.get(this.getProfileKey('urlPreviewMode'));
    const savedHideSensitiveContent = await platformStorageProvider.get(this.getProfileKey('hideSensitiveContentMode'));

    const updates: Partial<UserPreferencesState> = {};

    if (savedPostLength && (savedPostLength === 'mini' || savedPostLength === 'full')) {
      updates.postLength = savedPostLength as 'mini' | 'full';
    }

    if (savedUrlPreviews && (savedUrlPreviews === 'enabled' || savedUrlPreviews === 'disabled')) {
      updates.urlPreviews = savedUrlPreviews as 'enabled' | 'disabled';
    }

    if (savedHideSensitiveContent && (savedHideSensitiveContent === 'enabled' || savedHideSensitiveContent === 'disabled')) {
      updates.hideSensitiveContent = savedHideSensitiveContent as 'enabled' | 'disabled';
    }

    if (Object.keys(updates).length > 0) {
      this.set(updates);
    }
  };

  savePreferences = async (preferences: Partial<UserPreferencesState>) => {
    const promises: Promise<void>[] = [];

    if (preferences.postLength !== undefined) {
      promises.push(platformStorageProvider.set(this.getProfileKey('postLengthMode'), preferences.postLength));
    }

    if (preferences.urlPreviews !== undefined) {
      promises.push(platformStorageProvider.set(this.getProfileKey('urlPreviewMode'), preferences.urlPreviews));
    }

    if (preferences.hideSensitiveContent !== undefined) {
      promises.push(platformStorageProvider.set(this.getProfileKey('hideSensitiveContentMode'), preferences.hideSensitiveContent));
    }

    await Promise.all(promises);
  };
}

export const userPreferencesStore = new UserPreferencesStoreImpl();
