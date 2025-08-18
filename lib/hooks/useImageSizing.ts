import { imageSizingStore } from '@/lib/stores/image-sizing-store';
import { useStore } from '@/lib/stores/useWelshmanStore2';

export const useImageSizing = () => {
  const [state] = useStore(imageSizingStore);

  if (!state) {
    return {
      currentStrategy: imageSizingStore.getCurrentStrategy(),
      availableStrategies: [],
      setStrategy: imageSizingStore.setStrategy,
      cycleToNextStrategy: imageSizingStore.cycleToNextStrategy,
      getCurrentStrategy: imageSizingStore.getCurrentStrategy
    };
  }

  return {
    ...state,
    setStrategy: imageSizingStore.setStrategy,
    cycleToNextStrategy: imageSizingStore.cycleToNextStrategy,
    getCurrentStrategy: imageSizingStore.getCurrentStrategy
  };
};
