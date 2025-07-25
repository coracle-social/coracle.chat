import { ImageSizingConfig, ImageSizingPresets } from '@/lib/utils/imageSizing';
import { platformStorageProvider } from './storage-provider';

type ImageSizingState = {
  currentStrategy: ImageSizingConfig | 'no-images';
  availableStrategies: {
    name: string;
    config: ImageSizingConfig | 'no-images';
    description: string;
  }[];
};

type ImageSizingStore = {
  subscribe: (callback: (state: ImageSizingState) => void) => () => void;
  set: (state: Partial<ImageSizingState>) => void;
  setStrategy: (strategy: ImageSizingConfig | 'no-images') => void;
  cycleToNextStrategy: () => void;
  getCurrentStrategy: () => ImageSizingConfig | 'no-images';
  loadSavedStrategy: () => Promise<void>;
  saveStrategy: (strategy: ImageSizingConfig | 'no-images') => Promise<void>;
};

class ImageSizingStoreImpl implements ImageSizingStore {
  private state: ImageSizingState = {
    currentStrategy: ImageSizingPresets.aspectRatio.original,
    availableStrategies: [
      {
        name: 'No Images',
        config: 'no-images',
        description: 'Show only URLs, no image previews'
      },
      {
        name: 'Aspect Ratio',
        config: ImageSizingPresets.aspectRatio.original,
        description: 'Preserves original image proportions'
      },
      {
        name: 'Square Grid',
        config: ImageSizingPresets.aspectRatio.square,
        description: 'Forces square aspect ratio'
      },
      {
        name: 'Landscape',
        config: ImageSizingPresets.aspectRatio.landscape,
        description: '16:9 landscape format'
      },
      {
        name: 'Portrait',
        config: ImageSizingPresets.aspectRatio.portrait,
        description: '3:4 portrait format'
      },
      {
        name: 'Large Thumbnails',
        config: ImageSizingPresets.exact.medium,
        description: 'Fixed 300x200 size'
      },
      {
        name: 'Small Thumbnails',
        config: ImageSizingPresets.exact.thumbnail,
        description: 'Fixed 100x100 size'
      }
    ]
  };

  private subscribers: Set<(state: ImageSizingState) => void> = new Set();

  constructor() {
    // Load saved strategy on initialization
    this.loadSavedStrategy();
  }

  subscribe(callback: (state: ImageSizingState) => void) {
    this.subscribers.add(callback);
    // Call immediately with current state
    callback(this.state);

    return () => {
      this.subscribers.delete(callback);
    };
  }

  set(newState: Partial<ImageSizingState>) {
    this.state = { ...this.state, ...newState };
    this.notifySubscribers();
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.state));
  }

  setStrategy = async (strategy: ImageSizingConfig | 'no-images') => {
    this.set({ currentStrategy: strategy });
    await this.saveStrategy(strategy);
  };

  cycleToNextStrategy = async () => {
    const currentIndex = this.state.availableStrategies.findIndex(
      s => s.config === this.state.currentStrategy
    );
    const nextIndex = (currentIndex + 1) % this.state.availableStrategies.length;
    const nextStrategy = this.state.availableStrategies[nextIndex].config;
    await this.setStrategy(nextStrategy);
  };

  getCurrentStrategy = () => {
    return this.state.currentStrategy;
  };

  loadSavedStrategy = async () => {
    try {
      const savedStrategy = await platformStorageProvider.get('imageSizingStrategy');
      if (savedStrategy) {
        if (savedStrategy === 'no-images') {
          this.set({ currentStrategy: 'no-images' });
        } else if (typeof savedStrategy === 'object') {
          this.set({ currentStrategy: savedStrategy as ImageSizingConfig });
        }
      }
    } catch (error) {
      console.warn('Failed to load saved image sizing strategy:', error);
    }
  };

  saveStrategy = async (strategy: ImageSizingConfig | 'no-images') => {
    try {
      await platformStorageProvider.set('imageSizingStrategy', strategy);
    } catch (error) {
      console.warn('Failed to save image sizing strategy:', error);
    }
  };
}

export const imageSizingStore = new ImageSizingStoreImpl();
