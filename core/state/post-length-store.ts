import { platformStorageProvider } from './storage-provider';

type PostLengthMode = 'mini' | 'full';

type PostLengthState = {
  currentMode: PostLengthMode;
  availableModes: {
    name: string;
    mode: PostLengthMode;
    description: string;
  }[];
};

type PostLengthStore = {
  subscribe: (callback: (state: PostLengthState) => void) => () => void;
  set: (state: Partial<PostLengthState>) => void;
  setMode: (mode: PostLengthMode) => void;
  cycleToNextMode: () => void;
  getCurrentMode: () => PostLengthMode;
  loadSavedMode: () => Promise<void>;
  saveMode: (mode: PostLengthMode) => Promise<void>;
};

class PostLengthStoreImpl implements PostLengthStore {
  private state: PostLengthState = {
    currentMode: 'mini', // Default to mini posts
    availableModes: [
      {
        name: 'Mini Posts',
        mode: 'mini',
        description: 'Compact posts with limited height and scrollable content'
      },
      {
        name: 'Full Posts',
        mode: 'full',
        description: 'Full-length posts without height constraints'
      }
    ]
  };

  private subscribers: Set<(state: PostLengthState) => void> = new Set();

  constructor() {
    // Load saved mode on initialization
    this.loadSavedMode();
  }

  subscribe(callback: (state: PostLengthState) => void) {
    this.subscribers.add(callback);
    // Call immediately with current state
    callback(this.state);

    return () => {
      this.subscribers.delete(callback);
    };
  }

  set(newState: Partial<PostLengthState>) {
    this.state = { ...this.state, ...newState };
    this.notifySubscribers();
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.state));
  }

  setMode = async (mode: PostLengthMode) => {
    this.set({ currentMode: mode });
    await this.saveMode(mode);
  };

  cycleToNextMode = async () => {
    const currentIndex = this.state.availableModes.findIndex(
      m => m.mode === this.state.currentMode
    );
    const nextIndex = (currentIndex + 1) % this.state.availableModes.length;
    const nextMode = this.state.availableModes[nextIndex].mode;
    await this.setMode(nextMode);
  };

  getCurrentMode = () => {
    return this.state.currentMode;
  };

  loadSavedMode = async () => {
    try {
      const savedMode = await platformStorageProvider.get('postLengthMode');
      if (savedMode && (savedMode === 'mini' || savedMode === 'full')) {
        this.set({ currentMode: savedMode as PostLengthMode });
      }
    } catch (error) {
      console.warn('Failed to load saved post length mode:', error);
    }
  };

  saveMode = async (mode: PostLengthMode) => {
    try {
      await platformStorageProvider.set('postLengthMode', mode);
    } catch (error) {
      console.warn('Failed to save post length mode:', error);
    }
  };
}

export const postLengthStore = new PostLengthStoreImpl();
